import { useState, type ReactNode } from "react";
import { Pencil, Trash2, Plus, Check, X } from "lucide-react";
import { Button } from "./Button";
import { ConfirmDialog } from "./ConfirmDialog";
import { useLongPressReveal, LONG_PRESS_ROW_ATTR } from "../hooks/useLongPressReveal";
import { notificationController } from "../notifications/notificationController";

interface ListEditorProps<T> {
  items: T[];
  emptyItem: T;
  isSaving: boolean;
  onSave: (items: T[]) => void;
  renderRow: (item: T) => ReactNode;
  renderForm: (item: T, onChange: (item: T) => void) => ReactNode;
  validate: (item: T) => boolean;
  // Checked against every OTHER item in the list (the one being edited is
  // excluded) after `validate` passes — kept separate from `validate`
  // rather than folded into it, since a duplicate isn't "this item's own
  // fields are invalid," it's "this item collides with a sibling," and it
  // gets its own explicit error toast (via notificationController) instead
  // of `validate`'s existing silent block, since a fully-filled-out item
  // failing to save with zero explanation would be far more confusing here
  // than for an ordinary empty-required-field case.
  isDuplicate?: (item: T, otherItems: T[]) => boolean;
  duplicateMessage?: string;
}

export function ListEditor<T>({
  items,
  emptyItem,
  isSaving,
  onSave,
  renderRow,
  renderForm,
  validate,
  isDuplicate,
  duplicateMessage,
}: ListEditorProps<T>) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<T | null>(null);
  const [deleteIndex, setDeleteIndex] = useState<number | null>(null);
  const { revealedId, onTouchStart, onTouchEnd, consumeLongPress } = useLongPressReveal();

  function startEdit(index: number) {
    setEditingIndex(index);
    setDraft(items[index]);
  }

  function startAdd() {
    setEditingIndex(items.length);
    setDraft(emptyItem);
  }

  function cancelEdit() {
    setEditingIndex(null);
    setDraft(null);
  }

  function confirmSave() {
    if (!draft || editingIndex === null || !validate(draft)) return;
    const otherItems = items.filter((_, i) => i !== editingIndex);
    if (isDuplicate?.(draft, otherItems)) {
      notificationController.showError(
        duplicateMessage ?? "An identical entry already exists.",
      );
      return;
    }
    const next = [...items];
    next[editingIndex] = draft;
    onSave(next);
    setEditingIndex(null);
    setDraft(null);
  }

  function confirmDelete() {
    if (deleteIndex === null) return;
    onSave(items.filter((_, i) => i !== deleteIndex));
    setDeleteIndex(null);
  }

  const editForm = draft && (
    <div className="py-4">
      {renderForm(draft, setDraft)}
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={cancelEdit}
          aria-label="Cancel"
          className="rounded-lg p-2 text-text-secondary transition-colors duration-300 hover:text-text-primary"
        >
          <X className="h-4 w-4" />
        </button>
        <Button
          type="button"
          isLoading={isSaving}
          onClick={confirmSave}
          aria-label="Save"
          className="rounded-lg bg-accent p-2 text-bg-base transition-colors duration-300 hover:bg-accent/90"
        >
          <Check className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );

  return (
    <div>
      <div className="divide-y divide-border-default">
        {items.map((item, index) => (
          <div key={index}>
            {editingIndex === index ? (
              editForm
            ) : (
              <div
                {...{ [LONG_PRESS_ROW_ATTR]: String(index) }}
                onClick={() => {
                  if (consumeLongPress()) return;
                  startEdit(index);
                }}
                onTouchStart={() => onTouchStart(String(index))}
                onTouchEnd={onTouchEnd}
                onTouchMove={onTouchEnd}
                className="group flex cursor-pointer items-center justify-between gap-3 py-3 select-none"
              >
                <div className="min-w-0 flex-1">{renderRow(item)}</div>
                <div
                  className={`flex shrink-0 gap-1 transition-opacity duration-300 group-hover:opacity-100 ${
                    revealedId === String(index) ? "opacity-100" : "opacity-0"
                  }`}
                >
                  <button
                    type="button"
                    aria-label="Edit"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(index);
                    }}
                    className={`rounded-lg p-2 transition-colors duration-300 ${
                      revealedId === String(index)
                        ? "text-accent"
                        : "text-text-secondary hover:text-accent"
                    }`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    aria-label="Delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteIndex(index);
                    }}
                    className={`rounded-lg p-2 transition-colors duration-300 ${
                      revealedId === String(index)
                        ? "text-danger"
                        : "text-text-secondary hover:text-danger"
                    }`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
        {editingIndex === items.length && editForm}
      </div>
      {editingIndex !== items.length && (
        <button
          type="button"
          onClick={startAdd}
          className="mt-4 flex items-center gap-2 rounded-lg border border-dashed border-border-default px-4 py-2 text-sm text-text-secondary transition-colors duration-300 hover:border-accent hover:text-accent"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
      )}
      <ConfirmDialog
        open={deleteIndex !== null}
        title="Delete this item?"
        description="This can't be undone."
        isLoading={isSaving}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteIndex(null)}
      />
    </div>
  );
}
