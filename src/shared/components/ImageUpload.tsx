import { useRef, useState, type ChangeEvent } from "react";
import { Paperclip, Loader2 } from "lucide-react";
import { uploadImage, ImageValidationError } from "../file-upload/uploadImage";
import { notificationController } from "../notifications/notificationController";

interface ImageUploadProps {
  value: string | null;
  onChange: (url: string) => void;
  folder: string;
  shape?: "square" | "circle" | "portrait";
}

const SHAPE_CLASSES = {
  square: "h-28 w-28 rounded-lg",
  circle: "h-28 w-28 rounded-full",
  portrait: "h-40 w-32 rounded-lg",
};

export function ImageUpload({
  value,
  onChange,
  folder,
  shape = "square",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setIsUploading(true);

    try {
      const url = await uploadImage(file, folder);
      onChange(url);
    } catch (err) {
      const message =
        err instanceof ImageValidationError
          ? err.message
          : "Image upload failed";
      notificationController.showError(message);
    } finally {
      setIsUploading(false);
      setPreview(null);
      URL.revokeObjectURL(localUrl);
    }
  }

  const displayUrl = preview ?? value;

  return (
    <div
      className={`group relative shrink-0 overflow-hidden border border-border-default bg-bg-base/50 ${SHAPE_CLASSES[shape]}`}
    >
      {displayUrl ? (
        <img src={displayUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center px-2 text-center text-xs text-text-secondary">
          No image
        </div>
      )}
      <button
        type="button"
        aria-label="Upload image"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
        className="absolute bottom-1.5 left-1/2 flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full bg-bg-base/80 text-text-primary opacity-0 shadow-md transition-all duration-300 group-hover:opacity-100 hover:text-accent disabled:opacity-50"
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Paperclip className="h-4 w-4" />
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
