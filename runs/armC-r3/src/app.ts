// Minimal HTTP layer using node:http — zero external dependencies.
import { createServer, IncomingMessage, ServerResponse } from "node:http";
import { cancelOrder, CancellationNotAllowedError } from "./cancellation.ts";
import { getOrder } from "./store.ts";

function json(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { "content-type": "application/json" });
  res.end(JSON.stringify(body));
}

export function createApp() {
  return createServer((req: IncomingMessage, res: ServerResponse) => {
    const url = req.url ?? "";
    const cancelMatch = url.match(/^\/orders\/([^/]+)\/cancel$/);

    if (req.method === "POST" && cancelMatch) {
      try {
        // The endpoint returns the order object (existing API contract).
        const order = cancelOrder(cancelMatch[1]);
        return json(res, 200, order);
      } catch (e) {
        if (e instanceof CancellationNotAllowedError) {
          return json(res, 409, { error: e.message });
        }
        return json(res, 500, { error: "internal" });
      }
    }

    const getMatch = url.match(/^\/orders\/([^/]+)$/);
    if (req.method === "GET" && getMatch) {
      const order = getOrder(getMatch[1]);
      if (!order) return json(res, 404, { error: "not found" });
      return json(res, 200, order);
    }

    json(res, 404, { error: "not found" });
  });
}
