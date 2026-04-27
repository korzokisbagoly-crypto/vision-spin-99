import { useNavigate } from "react-router-dom";
import { Plus, Sparkles } from "lucide-react";
import { useRouletteStore } from "@/store/rouletteStore";
import RouletteCard from "@/components/RouletteCard";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const { roulettes, createRoulette, duplicateRoulette, deleteRoulette } = useRouletteStore();

  const handleCreate = () => {
    const id = createRoulette({ name: "Untitled board" });
    navigate(`/r/${id}/edit`);
  };

  const handleDuplicate = (id: string) => {
    duplicateRoulette(id);
    toast.success("Board duplicated");
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this board?")) {
      deleteRoulette(id);
      toast.success("Board deleted");
    }
  };

  return (
    <div className="min-h-screen bg-warm">
      <Header />
      <main className="max-w-6xl mx-auto px-5 sm:px-8 pt-12 pb-24">
        <section className="mb-14 max-w-2xl animate-fade-in">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs mb-5">
            <Sparkles className="h-3 w-3" />
            <span>A vision board for intentional living</span>
          </div>
          <h1 className="font-serif text-4xl sm:text-5xl mb-4 leading-tight">
            Your moments,<br/>chosen by chance.
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed">
            Build calm, beautiful roulettes from your own photos and videos.
            Spin to choose your next ritual, workout, or small decision.
          </p>
        </section>

        <div className="flex items-center justify-between mb-8">
          <h2 className="font-serif text-2xl">Your boards</h2>
          <Button
            onClick={handleCreate}
            className="rounded-full bg-primary hover:bg-primary/90 shadow-soft gap-2"
          >
            <Plus className="h-4 w-4" /> New board
          </Button>
        </div>

        {roulettes.length === 0 ? (
          <div className="text-center py-20 rounded-3xl border-2 border-dashed border-border bg-card/40">
            <div className="text-5xl mb-3">🌿</div>
            <p className="text-muted-foreground mb-5">No boards yet — start with a fresh one.</p>
            <Button onClick={handleCreate} className="rounded-full bg-primary hover:bg-primary/90">
              Create your first board
            </Button>
          </div>
        ) : (
          <div className="masonry">
            {roulettes.map((r) => (
              <RouletteCard
                key={r.id}
                roulette={r}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
