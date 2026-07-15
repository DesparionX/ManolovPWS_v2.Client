import { Container } from "../components/Container";

export function Footer() {
  return (
    <footer className="border-t border-border-default">
      <Container>
        <div className="flex flex-col items-center justify-between gap-2 py-6 text-sm text-text-secondary md:flex-row">
          <span>&copy; {new Date().getFullYear()} Manolov</span>
        </div>
      </Container>
    </footer>
  );
}
