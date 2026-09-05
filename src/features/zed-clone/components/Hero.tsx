// Hero section. The background is a soft multi-stop gradient standing in for
// the brief's canvas-rendered dithering effect (--dithering-front/back,
// --motif-accent-*) - cheap CSS approximation, not the real shader.

export function Hero() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden px-6 py-24 text-center"
      style={{ backgroundColor: "#F7F7F2" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 20%, #1E69F6 0%, transparent 45%), " +
            "radial-gradient(circle at 80% 10%, #93CCDC 0%, transparent 40%), " +
            "radial-gradient(circle at 50% 90%, #0751CF 0%, transparent 50%)",
        }}
      />
      <div className="relative mx-auto max-w-3xl">
        <h1
          className="text-5xl md:text-6xl"
          style={{ fontWeight: 340, color: "#1B1B18", letterSpacing: "-0.02em" }}
        >
          Code at the speed of thought
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg" style={{ color: "#474C55" }}>
          Zed is a next-generation code editor designed for high-performance collaboration with
          humans and AI.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#download"
            className="rounded-md px-6 py-3 text-sm font-medium text-white"
            style={{ backgroundColor: "#1348DC", boxShadow: "0 3px 3px #0000001f" }}
          >
            Download for free
          </a>
          <a
            href="#product"
            className="rounded-md border px-6 py-3 text-sm font-medium"
            style={{ borderColor: "#0000001a", color: "#1B1B18" }}
          >
            See how it works
          </a>
        </div>
        <p className="mt-4 text-xs" style={{ color: "#8A8F98" }}>
          Available for macOS, Linux, and Windows
        </p>
      </div>
    </section>
  );
}
