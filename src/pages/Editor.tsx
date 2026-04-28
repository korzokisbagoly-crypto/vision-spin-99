import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Play } from "lucide-react";
import Header from "@/components/Header";
import MediaUpload from "@/components/MediaUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useRouletteStore } from "@/store/rouletteStore";
import { PALETTE } from "@/types/roulette";
import { toast } from "sonner";

export default function Editor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const roulette = useRouletteStore((s) => s.roulettes.find((r) => r.id === id));
  const { updateRoulette, addSegment, updateSegment, removeSegment } = useRouletteStore();

  if (!roulette) {
    return (
      <div className="min-h-screen bg-warm">
        <Header />
        <main className="max-w-2xl mx-auto px-5 pt-20 text-center">
          <p className="text-muted-foreground mb-4">This board doesn't exist.</p>
          <Button asChild className="rounded-full"><Link to="/">Back home</Link></Button>
        </main>
      </div>
    );
  }

  const handleAdd = () => {
    if (roulette.segments.length >= 50) {
      toast.error("Max 50 segments per board");
      return;
    }
    addSegment(roulette.id, { label: "New segment" });
  };

  return (
    <div className="min-h-screen bg-warm">
      <Header />
      <main className="max-w-3xl mx-auto px-5 sm:px-8 pt-8 pb-32">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-smooth">
          <ArrowLeft className="h-4 w-4" /> All boards
        </Link>

        {/* Wheel meta */}
        <section className="rounded-3xl bg-card shadow-card p-6 sm:p-8 mb-8 animate-fade-in">
          <h2 className="font-serif text-2xl mb-6">Board details</h2>
          <div className="grid sm:grid-cols-[100px_1fr] gap-5 items-start">
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Emoji</Label>
              <Input
                value={roulette.emoji ?? ""}
                onChange={(e) => updateRoulette(roulette.id, { emoji: e.target.value })}
                placeholder="🌿"
                maxLength={4}
                className="text-center text-2xl rounded-xl h-14"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Name</Label>
              <Input
                value={roulette.name}
                onChange={(e) => updateRoulette(roulette.id, { name: e.target.value })}
                placeholder="e.g. Morning Ritual"
                className="rounded-xl h-14 text-lg font-serif"
              />
            </div>
          </div>

          <div className="mt-6">
            <Label className="text-xs text-muted-foreground mb-3 block">Theme color</Label>
            <div className="flex flex-wrap gap-2">
              {PALETTE.map((c) => (
                <button
                  key={c}
                  onClick={() => updateRoulette(roulette.id, { themeColor: c })}
                  className={`h-9 w-9 rounded-full transition-spring hover:scale-110 ${roulette.themeColor === c ? "ring-2 ring-offset-2 ring-foreground/40" : ""}`}
                  style={{ background: c }}
                  aria-label={`Theme ${c}`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Segments */}
        <section>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-serif text-2xl">Segments</h2>
              <p className="text-xs text-muted-foreground mt-1">{roulette.segments.length} / 50</p>
            </div>
            <Button onClick={handleAdd} className="rounded-full bg-primary hover:bg-primary/90 gap-2">
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>

          <div className="space-y-3">
            {roulette.segments.map((seg, idx) => (
              <div key={seg.id} className="rounded-2xl bg-card shadow-soft p-4 sm:p-5 animate-fade-in">
                <div className="flex gap-3 sm:gap-4 items-start">
                  <MediaUpload
                    value={seg.mediaUrl}
                    type={seg.mediaType}
                    onChange={(url, type) => updateSegment(roulette.id, seg.id, { mediaUrl: url, mediaType: type })}
                    compact
                  />
                  <div className="flex-1 min-w-0 space-y-3">
                    <div className="flex gap-2">
                      <Input
                        value={seg.emoji ?? ""}
                        onChange={(e) => updateSegment(roulette.id, seg.id, { emoji: e.target.value })}
                        placeholder="🍵"
                        maxLength={4}
                        className="w-14 sm:w-16 text-center rounded-xl shrink-0"
                      />
                      <Input
                        value={seg.label}
                        onChange={(e) => updateSegment(roulette.id, seg.id, { label: e.target.value })}
                        placeholder={`Segment ${idx + 1}`}
                        className="rounded-xl flex-1 min-w-0"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-wrap gap-1.5">
                        {PALETTE.map((c) => (
                          <button
                            key={c}
                            onClick={() => updateSegment(roulette.id, seg.id, { color: c })}
                            className={`h-6 w-6 rounded-full transition-smooth ${seg.color === c ? "ring-2 ring-offset-1 ring-foreground/40" : ""}`}
                            style={{ background: c }}
                            aria-label="color"
                          />
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <Label className="text-[11px] uppercase tracking-wider text-muted-foreground">Weight</Label>
                        <span className="text-xs text-muted-foreground tabular-nums">×{seg.weight}</span>
                      </div>
                      <Slider
                        value={[seg.weight]}
                        min={1}
                        max={10}
                        step={1}
                        onValueChange={(v) => updateSegment(roulette.id, seg.id, { weight: v[0] })}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeSegment(roulette.id, seg.id)}
                    className="p-2 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-smooth"
                    aria-label="Remove segment"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}

            {roulette.segments.length === 0 && (
              <div className="text-center py-12 rounded-2xl border-2 border-dashed border-border bg-card/40">
                <p className="text-muted-foreground mb-4">Add your first segment to get started</p>
                <Button onClick={handleAdd} className="rounded-full bg-primary hover:bg-primary/90 gap-2">
                  <Plus className="h-4 w-4" /> Add segment
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Sticky CTA */}
        {roulette.segments.length >= 2 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-20">
            <Button
              onClick={() => navigate(`/r/${roulette.id}`)}
              size="lg"
              className="rounded-full px-8 bg-primary hover:bg-primary/90 shadow-float gap-2 transition-spring hover:scale-105"
            >
              <Play className="h-4 w-4 fill-current" /> Spin this board
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}