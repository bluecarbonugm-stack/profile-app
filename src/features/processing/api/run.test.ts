import { afterEach, describe, expect, it, vi } from "vitest";

import { executeGraph } from "./run";
import { executeNode } from "./service-client";

vi.mock("./service-client", () => ({
  SERVICE_URL: "http://processing-service.test",
  executeNode: vi.fn(),
}));

const mockedExecuteNode = vi.mocked(executeNode);

describe("executeGraph", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    mockedExecuteNode.mockReset();
  });

  it("preserves nested sample_points in request payload", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 200 }));
    mockedExecuteNode.mockResolvedValue({ implemented: false, summary: {}, outputs: {} });

    await executeGraph({
      nodes: [
        {
          id: "n1",
          specId: "sunglint",
          params: {
            sample_points: [
              { lat: -5, lon: 110 },
              { lat: -5, lon: 110.1 },
              { lat: -5, lon: 110.2 },
              { lat: -5, lon: 110.3 },
              { lat: -5, lon: 110.4 },
              { lat: -5, lon: 110.5 },
              { lat: -5, lon: 110.6 },
              { lat: -5, lon: 110.7 },
              { lat: -5, lon: 110.8 },
              { lat: -5, lon: 110.9 },
            ],
          },
        },
      ],
      edges: [],
    });

    expect(mockedExecuteNode).toHaveBeenCalledWith(
      "sunglint",
      {
        sample_points: [
          { lat: -5, lon: 110 },
          { lat: -5, lon: 110.1 },
          { lat: -5, lon: 110.2 },
          { lat: -5, lon: 110.3 },
          { lat: -5, lon: 110.4 },
          { lat: -5, lon: 110.5 },
          { lat: -5, lon: 110.6 },
          { lat: -5, lon: 110.7 },
          { lat: -5, lon: 110.8 },
          { lat: -5, lon: 110.9 },
        ],
      },
      {},
      ["out", "chart"],
    );
  });
});
