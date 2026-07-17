import { useRef, useState, type ChangeEvent } from "react";
import { Plus, Loader2, X } from "lucide-react";
import { uploadImage } from "../file-upload/uploadImage";
import { notificationController } from "../notifications/notificationController";

interface GalleryUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  folder: string;
  max?: number;
}

export function GalleryUpload({
  value,
  onChange,
  folder,
  max = 15,
}: GalleryUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadingCount, setUploadingCount] = useState(0);

  async function handleFilesChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (files.length === 0) return;

    const remaining = max - value.length;
    if (remaining <= 0) {
      notificationController.showError(`Gallery is limited to ${max} images`);
      return;
    }
    const filesToUpload = files.slice(0, remaining);

    setUploadingCount((c) => c + filesToUpload.length);
    const results = await Promise.allSettled(
      filesToUpload.map((file) => uploadImage(file, folder)),
    );
    setUploadingCount((c) => c - filesToUpload.length);

    const uploaded: string[] = [];
    let failedCount = 0;
    for (const result of results) {
      if (result.status === "fulfilled") uploaded.push(result.value);
      else failedCount++;
    }
    if (uploaded.length > 0) onChange([...value, ...uploaded]);
    if (failedCount > 0) {
      notificationController.showError(
        `${failedCount} image${failedCount > 1 ? "s" : ""} failed to upload`,
      );
    }
  }

  function handleRemove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {value.map((url, index) => (
          <div
            key={`${url}-${index}`}
            className="group relative h-20 w-20 overflow-hidden rounded-lg border border-border-default"
          >
            <img src={url} alt="" className="h-full w-full object-cover" />
            <button
              type="button"
              onClick={() => handleRemove(index)}
              aria-label="Remove image"
              className="absolute top-1 right-1 rounded-full bg-bg-base/80 p-1 text-text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {value.length < max && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploadingCount > 0}
            className="flex h-20 w-20 items-center justify-center rounded-lg border border-dashed border-border-default text-text-secondary transition-colors duration-300 hover:border-accent disabled:opacity-50"
          >
            {uploadingCount > 0 ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Plus className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        multiple
        className="hidden"
        onChange={handleFilesChange}
      />
    </div>
  );
}
