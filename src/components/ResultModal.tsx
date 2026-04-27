import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { Segment } from "@/types/roulette";
import { Button } from "@/components/ui/button";

interface Props {
  segment: Segment | null;
  open: boolean;
  onClose: () => void;
  onSpinAgain: () => void;
}

export default function ResultModal({ segment, open, onClose, onSpinAgain }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (open && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [open, segment]);

  if (!open || !segment) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/70 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-3xl bg-card shadow-float overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-full bg-background/90 p-2 shadow-soft hover:bg-background"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div
          className="relative aspect-square w-full"
          style={{ background: segment.color }}
        >
          {segment.mediaUrl ? (
            segment.mediaType === "video" ? (
              <video
                ref={videoRef}
                src={segment.mediaUrl}
                className="h-full w-full object-cover"
                autoPlay
                loop
                playsInline
                controls
              />
            ) : (
              <img src={segment.mediaUrl} alt={segment.label} className="h-full w-full object-cover" />
            )
          ) : (
            <div className="flex h-full w-full items-center justify-center text-9xl">
              {segment.emoji ?? "✨"}
            </div>
          )}
        </div>

        <div className="p-8 text-center">
          <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-3">Your moment</div>
          <h2 className="font-serif text-4xl mb-6">
            {segment.emoji && <span className="mr-2">{segment.emoji}</span>}
            {segment.label}
          </h2>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" className="rounded-full" onClick={onClose}>
              Done
            </Button>
            <Button className="rounded-full bg-primary hover:bg-primary/90" onClick={onSpinAgain}>
              Spin again
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}