import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="text-center">
      <h1>Welcome</h1>
      <p>Your application is ready to be built.</p>
    </div>
  );
}
