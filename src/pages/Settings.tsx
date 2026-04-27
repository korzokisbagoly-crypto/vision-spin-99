import { Link } from "react-router-dom";
import { ArrowLeft, Download, Upload } from "lucide-react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useRouletteStore } from "@/store/rouletteStore";
import { toast } from "sonner";
import { useRef } from "react";

export default function Settings() {
  const {
    roulettes, disciplineMode, dailyLimit, soundEnabled,
    toggleDiscipline, setDailyLimit, toggleSound, importJson,
  } = useRouletteStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(roulettes, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `loop-boards-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported");
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const ok = importJson(reader.result as string);
      if (ok) toast.success("Boards imported");
      else toast.error("Invalid file");
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen bg-warm">
      <Header />
      <main className="max-w-2xl mx-auto px-5 sm:px-8 pt-8 pb-24">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-smooth">
          <ArrowLeft className="h-4 w-4" /> All boards
        </Link>

        <h1 className="font-serif text-3xl mb-8">Settings</h1>

        <section className="rounded-3xl bg-card shadow-card p-6 sm:p-8 mb-6 space-y-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <Label className="text-base">Sound effects</Label>
              <p className="text-sm text-muted-foreground mt-1">Soft tick during spinning.</p>
            </div>
            <Switch checked={soundEnabled} onCheckedChange={toggleSound} />
          </div>

          <div className="border-t border-border pt-6">
            <div className="flex items-start justify-between gap-6 mb-4">
              <div>
                <Label className="text-base">Discipline mode</Label>
                <p className="text-sm text-muted-foreground mt-1">Limit how many times you spin each day.</p>
              </div>
              <Switch checked={disciplineMode} onCheckedChange={toggleDiscipline} />
            </div>
            {disciplineMode && (
              <div className="mt-4 animate-fade-in">
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm text-muted-foreground">Daily limit</Label>
                  <span className="text-sm tabular-nums">{dailyLimit} spins / day</span>
                </div>
                <Slider value={[dailyLimit]} min={1} max={20} step={1} onValueChange={(v) => setDailyLimit(v[0])} />
              </div>
            )}
          </div>
        </section>

        <section className="rounded-3xl bg-card shadow-card p-6 sm:p-8">
          <h2 className="font-serif text-xl mb-1">Backup</h2>
          <p className="text-sm text-muted-foreground mb-5">Export your boards as a portable JSON file.</p>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="rounded-full gap-2" onClick={handleExport}>
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button variant="outline" className="rounded-full gap-2" onClick={() => fileRef.current?.click()}>
              <Upload className="h-4 w-4" /> Import
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImport(f); e.target.value = ""; }}
            />
          </div>
        </section>
      </main>
    </div>
  );
}