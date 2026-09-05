// Mock rows for the Live Git Activity Feed section. Not real telemetry -
// this is a design clone, so the feed just cycles through canned commits.

export interface ActivityRow {
  repo: string;
  author: string;
  message: string;
  additions: number;
  deletions: number;
  branch: string;
}

export const MOCK_COMMITS: ActivityRow[] = [
  {
    repo: "zed-industries/zed",
    author: "as-cii",
    message: "gpui: fix scroll anchor drift on resize",
    additions: 42,
    deletions: 11,
    branch: "main",
  },
  {
    repo: "zed-industries/zed",
    author: "mikayla",
    message: "collab: debounce presence broadcast",
    additions: 18,
    deletions: 4,
    branch: "main",
  },
  {
    repo: "zed-industries/zed",
    author: "conrad",
    message: "editor: multi-cursor paste alignment",
    additions: 63,
    deletions: 27,
    branch: "editor-fixes",
  },
  {
    repo: "zed-industries/zed",
    author: "iamnbutler",
    message: "ui: tighten command palette spacing",
    additions: 9,
    deletions: 9,
    branch: "main",
  },
  {
    repo: "zed-industries/zed",
    author: "maxdeviant",
    message: "lsp: retry on stdio pipe reset",
    additions: 31,
    deletions: 6,
    branch: "lsp-hardening",
  },
  {
    repo: "zed-industries/zed",
    author: "julia",
    message: "vim: fix visual block yank offset",
    additions: 22,
    deletions: 8,
    branch: "main",
  },
  {
    repo: "zed-industries/zed",
    author: "kirill",
    message: "terminal: honor $TERM override in ssh",
    additions: 14,
    deletions: 2,
    branch: "main",
  },
  {
    repo: "zed-industries/zed",
    author: "thorstenball",
    message: "agent: stream tool call diffs incrementally",
    additions: 88,
    deletions: 15,
    branch: "agent-streaming",
  },
];

export function cycledFeed(tick: number, size = 5): ActivityRow[] {
  const n = MOCK_COMMITS.length;
  return Array.from({ length: size }, (_, i) => MOCK_COMMITS[(tick + i) % n]);
}
