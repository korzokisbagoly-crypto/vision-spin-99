import { Link } from "react-router-dom";
import { MoreHorizontal, Copy, Trash2, Pencil } from "lucide-react";
import type { Roulette } from "@/types/roulette";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Props {
  roulette: Roulette;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function RouletteCard({ roulette, onDuplicate, onDelete }: Props) {
  const previews = roulette.segments.filter((s) => s.mediaUrl).slice(0, 4);
  const segmentCount = roulette.segments.length;

  return (
    <div className="group relative rounded-3xl bg-card shadow-card overflow-hidden transition-smooth hover:shadow-float hover:-translate-y-1 animate-fade-in">
      <Link to={`/r/${roulette.id}`} className="block">
        <div
          className="relative aspect-[4/5] w-full overflow-hidden"
          style={{ background: roulette.themeColor }}
        >
          {previews.length > 0 ? (
            <div className={`grid h-full w-full gap-0.5 ${previews.length === 1 ? "" : previews.length === 2 ? "grid-cols-2" : "grid-cols-2 grid-rows-2"}`}>
              {previews.map((s) => (
                <div key={s.id} className="overflow-hidden bg-muted">
                  {s.mediaType === "video" ? (
                    <video src={s.mediaUrl} className="h-full w-full object-cover" muted />
                  ) : (
                    <img src={s.mediaUrl} alt={s.label} loading="lazy" className="h-full w-full object-cover" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <div className="text-7xl opacity-90">{roulette.emoji ?? "🎯"}</div>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className="flex items-end justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs text-background/80 mb-1">
                  {segmentCount} {segmentCount === 1 ? "segment" : "segments"}
                </div>
                <h3 className="font-serif text-xl text-background truncate">
                  {roulette.emoji && <span className="mr-1.5">{roulette.emoji}</span>}
                  {roulette.name}
                </h3>
              </div>
            </div>
          </div>
        </div>
      </Link>

      <div className="absolute top-3 right-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-smooth">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="rounded-full bg-background/90 backdrop-blur p-2 shadow-soft hover:bg-background"
              aria-label="Options"
              onClick={(e) => e.preventDefault()}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-2xl">
            <DropdownMenuItem asChild>
              <Link to={`/r/${roulette.id}/edit`}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate(roulette.id)}>
              <Copy className="mr-2 h-4 w-4" /> Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDelete(roulette.id)} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}