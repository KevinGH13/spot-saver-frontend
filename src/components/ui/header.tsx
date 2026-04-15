export default function Header() {
  return (
    <header
      className="w-full px-8 py-4 bg-white fixed top-0 left-0 z-50 flex items-center justify-center"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <h1
        className="text-2xl font-bold"
        style={{ color: "var(--palette-bg-primary-core)", letterSpacing: "-0.44px" }}
      >
        Spot Saver
      </h1>
    </header>
  );
}
