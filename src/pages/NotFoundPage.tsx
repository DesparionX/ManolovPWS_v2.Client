import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { Container } from "../shared/components/Container";

export function NotFoundPage() {
  return (
    <Container className="flex flex-1 flex-col items-center justify-center py-16">
      <div className="mx-auto w-full max-w-xl overflow-hidden rounded-xl border border-border-default/50 bg-bg-surface/60 p-10 text-center shadow-md backdrop-blur-md">
        <Compass className="mx-auto mb-4 h-12 w-12 text-text-secondary" />
        <p className="mb-1 text-5xl font-bold text-accent">404</p>
        <h1 className="mb-2 text-lg font-semibold text-text-primary">
          Page not found
        </h1>
        <p className="mb-6 text-sm text-text-secondary">
          The page you're looking for doesn't exist or may have moved.
        </p>
        <Link
          to="/"
          className="inline-block rounded-lg border border-border-default px-4 py-2 text-sm text-text-primary transition-colors duration-300 hover:border-accent"
        >
          Back to Home
        </Link>
      </div>
    </Container>
  );
}
