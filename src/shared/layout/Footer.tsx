import { Container } from "../components/Container";

export function Footer() {
  return (
    <footer className="border-t border-border-default bg-bg-base/90">
      <Container>
        <div className="flex justify-center py-6 text-sm text-text-primary">
          <span>by Manolov - {new Date().getFullYear()}</span>
        </div>
      </Container>
    </footer>
  );
}
