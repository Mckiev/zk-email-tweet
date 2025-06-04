import { createFileRoute } from "@tanstack/react-router";
import { FlappyBirdGame } from "@/components/FlappyBirdGame";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-sky-400 flex flex-col items-center justify-center">
      <div className="text-center mb-8">
        <h1 className="text-6xl font-bold text-white mb-2 drop-shadow-lg">🐦 Flappy Bird</h1>
        <p className="text-xl text-white/90">Click or press spacebar to flap!</p>
      </div>
      <FlappyBirdGame />
    </div>
  );
}
