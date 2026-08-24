export interface TopoSortNode {
  id: string;
}

export interface TopoSortEdge {
  source: string;
  target: string;
}

export type TopoSortResult = { ok: true; order: string[] } | { ok: false; cycle: string[] };

export function topoSort(nodes: TopoSortNode[], edges: TopoSortEdge[]): TopoSortResult {
  const inDegree = new Map<string, number>();
  const adjacency = new Map<string, string[]>();

  for (const node of nodes) {
    inDegree.set(node.id, 0);
    adjacency.set(node.id, []);
  }

  for (const edge of edges) {
    adjacency.get(edge.source)?.push(edge.target);
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1);
  }

  const queue = [...inDegree.entries()].filter(([, degree]) => degree === 0).map(([id]) => id);
  const order: string[] = [];

  while (queue.length > 0) {
    const id = queue.shift() as string;
    order.push(id);
    for (const next of adjacency.get(id) ?? []) {
      const degree = (inDegree.get(next) ?? 0) - 1;
      inDegree.set(next, degree);
      if (degree === 0) queue.push(next);
    }
  }

  if (order.length !== nodes.length) {
    const cycle = nodes.map((n) => n.id).filter((id) => !order.includes(id));
    return { ok: false, cycle };
  }

  return { ok: true, order };
}
