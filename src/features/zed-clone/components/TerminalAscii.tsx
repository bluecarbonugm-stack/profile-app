const MONO_FONT = "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";

// Box-drawing "ZED" wordmark, framed as a zsh prompt.
const ASCII_ZED = String.raw`
 ███████╗███████╗██████╗
 ╚══███╔╝██╔════╝██╔══██╗
   ███╔╝ █████╗  ██║  ██║
  ███╔╝  ██╔══╝  ██║  ██║
 ███████╗███████╗██████╔╝
 ╚══════╝╚══════╝╚═════╝
`.trim();

export function TerminalAscii() {
  return (
    <section id="terminal" className="px-6 py-20" style={{ backgroundColor: "#F7F7F2" }}>
      <div
        className="mx-auto max-w-2xl overflow-hidden rounded-lg"
        style={{ backgroundColor: "#0F0F0D", boxShadow: "6px 6px 0 #074dcf0f" }}
      >
        <div
          className="flex items-center px-4 py-2 text-xs"
          style={{ borderBottom: "1px solid #ffffff14", color: "#8A8F98", fontFamily: MONO_FONT }}
        >
          zed.dev - zsh
        </div>
        <pre
          className="overflow-x-auto px-6 py-8 text-center text-xs leading-tight md:text-sm"
          style={{ fontFamily: MONO_FONT, color: "#93CCDC" }}
        >
          {ASCII_ZED}
        </pre>
        <div
          className="px-6 pb-6 text-center text-xs"
          style={{ fontFamily: MONO_FONT, color: "#8A8F98" }}
        >
          ~/zed $ <span style={{ color: "#00C950" }}>zed .</span>
          <span className="ml-1 animate-pulse">▍</span>
        </div>
      </div>
    </section>
  );
}
