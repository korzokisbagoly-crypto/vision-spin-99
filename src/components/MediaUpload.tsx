import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { putMedia, deleteMedia } from "@/lib/mediaStore";
import { useMediaUrl } from "@/hooks/useMediaUrl";
import { toast } from "sonner";

interface Props {
  value?: string; // media id (or legacy data URL)
  type?: "image" | "video";
  onChange: (mediaId: string | undefined, type: "image" | "video" | undefined) => void;
  className?: string;
  compact?: boolean;
}

export default function MediaUpload({ value, type, onChange, className, compact }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState(false);
  const previewUrl = useMediaUrl(value);

  const handleFile = async (file: File) => {
    const isVideo = file.type.startsWith("video");
    setBusy(true);
    try {
      // If replacing existing IndexedDB media, clean it up.
      if (value && !/^(data:|blob:|https?:)/.test(value)) {
        deleteMedia(value).catch(() => {});
      }
      const id = await putMedia(file);
      onChange(id, isVideo ? "video" : "image");
    } catch (err) {
      console.error("Upload failed", err);
      toast.error("Could not save media. Try a smaller file.");
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = () => {
    if (value && !/^(data:|blob:|https?:)/.test(value)) {
      deleteMedia(value).catch(() => {});
    }
    onChange(undefined, undefined);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault(); setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f) handleFile(f);
      }}
      onClick={() => inputRef.current?.click()}
      className={cn(
        "relative cursor-pointer rounded-2xl border-2 border-dashed border-border bg-muted/40 transition-smooth hover:border-primary/40 hover:bg-muted/60 overflow-hidden flex items-center justify-center",
        dragOver && "border-primary bg-primary-soft",
        compact ? "h-20 w-20" : "aspect-square w-full",
        className
      )}
    >
      {value ? (
        <>
          {type === "video" ? (
            <video src={previewUrl} className="h-full w-full object-cover" muted playsInline />
          ) : (
            <img src={previewUrl} alt="upload" className="h-full w-full object-cover" />
          )}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleRemove(); }}
            className="absolute top-1 right-1 rounded-full bg-background/90 p-1 shadow-soft hover:bg-background"
            aria-label="Remove media"
          >
            <X className="h-3 w-3" />
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center gap-1 text-muted-foreground p-2 text-center">
          <Upload className={compact ? "h-4 w-4" : "h-6 w-6"} />
          {!compact && <span className="text-xs">{busy ? "Saving…" : "Tap or drop media"}</span>}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}