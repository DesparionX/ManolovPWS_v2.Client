export function AppBackground() {
  return (
    <div
      aria-hidden="true"
      className="app-background pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="glow-orb glow-orb-a" />
      <div className="glow-orb glow-orb-b" />
    </div>
  );
}
