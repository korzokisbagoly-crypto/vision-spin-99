import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  value?: string;
  type?: "image" | "video";
  onChange: (dataUrl: string | undefined, type: "image" | "video" | undefined) => void;
  className?: string;
  compact?: boolean;
}

export default function MediaUpload({ value, type, onChange, className, compact }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = (file: File) => {
    const isVideo = file.type.startsWith("video");
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string, isVideo ? "video" : "image");
    reader.readAsDataURL(file);
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
            <video src={value} className="h-full w-full object-cover" muted />
          ) : (
            <img src={value} alt="upload" className="h-full w-full object-cover" />
          )}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onChange(undefined, undefined); }}
            className="absolute top-1 right-1 rounded-full bg-background/90 p-1 shadow-soft hover:bg-background"
            aria-label="Remove media"
          >
            <X className="h-3 w-3" />
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center gap-1 text-muted-foreground p-2 text-center">
          <Upload className={compact ? "h-4 w-4" : "h-6 w-6"} />
          {!compact && <span className="text-xs">Tap or drop media</span>}
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