import { createFileRoute } from "@tanstack/react-router";
import { ZkEmailVerifier } from "@/components/ZkEmailVerifier";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <div className="min-h-screen bg-base-200 py-8">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-base-content mb-4">
            ZK Email Twitter Verifier
          </h1>
          <p className="text-xl text-base-content/70">
            Verify Twitter login notification emails with zero-knowledge proofs
          </p>
        </div>
        
        <ZkEmailVerifier />
      </div>
    </div>
  );
}
