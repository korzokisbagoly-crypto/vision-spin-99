import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Pencil, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import RouletteWheel from "@/components/RouletteWheel";
import ResultModal from "@/components/ResultModal";
import { Button } from "@/components/ui/button";
import { useRouletteStore } from "@/store/rouletteStore";
import { toast } from "sonner";

export default function Spin() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const roulette = useRouletteStore((s) => s.roulettes.find((r) => r.id === id));
  const { registerSpin, disciplineMode, dailyLimit, soundEnabled } = useRouletteStore();

  const [spinning, setSpinning] = useState(false);
  const [targetIndex, setTargetIndex] = useState<number | null>(null);
  const [resultOpen, setResultOpen] = useState(false);
  const wheelContainerRef = useRef<HTMLDivElement>(null);
  const [wheelSize, setWheelSize] = useState(360);

  useEffect(() => {
    const el = wheelContainerRef.current;
    if (!el) return;
    const update = () => {
      const w = el.clientWidth;
      setWheelSize(Math.max(240, Math.min(420, w)));
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    window.addEventListener("resize", update);
    return () => { ro.disconnect(); window.removeEventListener("resize", update); };
  }, [roulette]);

  useEffect(() => {
    if (!roulette && id) {
      navigate("/");
    }
  }, [roulette, id, navigate]);

  const total = useMemo(
    () => roulette?.segments.reduce((s, x) => s + (x.weight || 1), 0) ?? 0,
    [roulette]
  );

  if (!roulette) return null;

  const today = new Date().toISOString().slice(0, 10);
  const spinsToday = roulette.lastSpinDate === today ? (roulette.spinsToday ?? 0) : 0;
  const limitReached = disciplineMode && spinsToday >= dailyLimit;

  const handleSpin = () => {
    if (roulette.segments.length < 2) {
      toast.error("Add at least 2 segments first");
      return;
    }
    if (limitReached) {
      toast.error(`Discipline mode: ${dailyLimit} spins per day`);
      return;
    }
    if (spinning) return;

    // weighted pick
    let r = Math.random() * total;
    let pickIdx = 0;
    for (let i = 0; i < roulette.segments.length; i++) {
      r -= roulette.segments[i].weight || 1;
      if (r <= 0) { pickIdx = i; break; }
    }

    setTargetIndex(pickIdx);
    setSpinning(true);
  };

  const handleComplete = () => {
    setSpinning(false);
    registerSpin(roulette.id);
    setTimeout(() => setResultOpen(true), 250);
  };

  const selected = targetIndex !== null ? roulette.segments[targetIndex] : null;

  return (
    <div className="min-h-screen bg-warm">
      <Header />
      <main className="max-w-3xl mx-auto px-5 sm:px-8 pt-8 pb-24">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-smooth">
          <ArrowLeft className="h-4 w-4" /> All boards
        </Link>

        <div className="flex items-start justify-between gap-3 mb-10 animate-fade-in">
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">
              {roulette.segments.length} segments · {roulette.spinCount} spins
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl break-words">
              {roulette.emoji && <span className="mr-2">{roulette.emoji}</span>}
              {roulette.name}
            </h1>
          </div>
          <Button asChild variant="ghost" size="sm" className="rounded-full shrink-0">
            <Link to={`/r/${roulette.id}/edit`}>
              <Pencil className="h-4 w-4 mr-1.5" /> Edit
            </Link>
          </Button>
        </div>

        <div className="flex flex-col items-center gap-10">
          {roulette.segments.length === 0 ? (
            <div className="text-center py-16 px-6 rounded-3xl border-2 border-dashed border-border w-full">
              <p className="text-muted-foreground mb-4">This board is empty.</p>
              <Button asChild className="rounded-full bg-primary hover:bg-primary/90">
                <Link to={`/r/${roulette.id}/edit`}>Add segments</Link>
              </Button>
            </div>
          ) : (
            <>
              <div ref={wheelContainerRef} className="relative w-full max-w-[420px] flex justify-center">
                <RouletteWheel
                  segments={roulette.segments}
                  size={wheelSize}
                  spinning={spinning}
                  targetIndex={targetIndex}
                  onComplete={handleComplete}
                  soundEnabled={soundEnabled}
                />
              </div>

              <Button
                onClick={handleSpin}
                disabled={spinning || limitReached}
                size="lg"
                className="rounded-full px-12 py-6 text-base bg-primary hover:bg-primary/90 shadow-card transition-spring hover:scale-105"
              >
                {spinning ? "Spinning..." : limitReached ? "Daily limit reached" : "Spin"}
              </Button>

              {disciplineMode && (
                <div className="text-xs text-muted-foreground">
                  Discipline mode · {spinsToday} / {dailyLimit} spins today
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <ResultModal
        segment={selected}
        open={resultOpen}
        onClose={() => setResultOpen(false)}
        onSpinAgain={() => { setResultOpen(false); setTimeout(handleSpin, 300); }}
      />
    </div>
  );
}