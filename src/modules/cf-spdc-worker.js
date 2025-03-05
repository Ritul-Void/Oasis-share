// Spdc worker - Cloudflare Worker + Durable Object
// This Worker exposes a simple HTTP API for WebRTC signalling.
//
// Endpoints:
//  POST   /api/peer-offer        { peerId, offer }
//  GET    /api/peer-offer/:id    -> { peerId, offer }                 (if exists)
//  POST   /api/peer-answer       { peerId, answer }
//  GET    /api/peer-answer/:id   -> { peerId, answer } or { pending }
//  DELETE /api/session/:id       -> delete both offer + answer
//
// You will need a Durable Object binding called SIGNALLING_DO
// (configure it in the dashboard or wrangler.toml accordingly).

// ---------- Helper: CORS + JSON responses ----------

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

function emptyResponse(status = 204) {
  return new Response(null, {
    status,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

// ---------- Durable Object class ----------

export class SignallingDurableObject {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method.toUpperCase();

    // CORS preflight
    if (method === "OPTIONS") {
      return emptyResponse(204);
    }

    try {
      // POST /api/peer-offer
      if (pathname === "/api/peer-offer" && method === "POST") {
        const body = await request.json().catch(() => ({}));
        const { peerId, offer } = body;

        if (!peerId || !offer) {
          return jsonResponse(
            { error: "peerId and offer are required" },
            400
          );
        }

        const key = `session:${peerId}`;
        const session = {
          peerId,
          offer,
          answer: null,
          createdAt: Date.now(),
        };

        await this.state.storage.put(key, session);

        return jsonResponse({ ok: true, peerId });
      }

      // GET /api/peer-offer/:peerId
      if (pathname.startsWith("/api/peer-offer/") && method === "GET") {
        const peerId = pathname.split("/").pop();
        const key = `session:${peerId}`;
        const session = await this.state.storage.get(key);

        if (!session || !session.offer) {
          return jsonResponse(
            { error: "offer-not-found", peerId },
            404
          );
        }

        return jsonResponse({
          peerId: session.peerId,
          offer: session.offer,
        });
      }

      // POST /api/peer-answer
      if (pathname === "/api/peer-answer" && method === "POST") {
        const body = await request.json().catch(() => ({}));
        const { peerId, answer } = body;

        if (!peerId || !answer) {
          return jsonResponse(
            { error: "peerId and answer are required" },
            400
          );
        }

        const key = `session:${peerId}`;
        const session = await this.state.storage.get(key);

        if (!session || !session.offer) {
          return jsonResponse(
            { error: "session-or-offer-not-found", peerId },
            404
          );
        }

        session.answer = answer;
        session.answeredAt = Date.now();

        await this.state.storage.put(key, session);

        return jsonResponse({ ok: true, peerId });
      }

      // GET /api/peer-answer/:peerId
      if (pathname.startsWith("/api/peer-answer/") && method === "GET") {
        const peerId = pathname.split("/").pop();
        const key = `session:${peerId}`;
        const session = await this.state.storage.get(key);

        if (!session) {
          return jsonResponse(
            { error: "session-not-found", peerId },
            404
          );
        }

        if (!session.answer) {
          // Answer not yet created
          return jsonResponse(
            { pending: true, peerId },
            200
          );
        }

        return jsonResponse({
          peerId: session.peerId,
          answer: session.answer,
        });
      }

      // DELETE /api/session/:peerId  (cleanup after connection established)
      if (pathname.startsWith("/api/session/") && method === "DELETE") {
        const peerId = pathname.split("/").pop();
        const key = `session:${peerId}`;
        await this.state.storage.delete(key);
        return jsonResponse({ ok: true, peerId });
      }

      // Fallback for unknown routes under /api/
      if (pathname.startsWith("/api/")) {
        return jsonResponse(
          { error: "not-found", path: pathname },
          404
        );
      }

      // If this DO accidentally gets non-API request
      return jsonResponse(
        { error: "invalid-endpoint-for-durable-object" },
        400
      );
    } catch (err) {
      return jsonResponse(
        {
          error: "internal-error",
          message: err?.message || String(err),
        },
        500
      );
    }
  }
}

// ---------- Main Worker ----------

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // Health check / root
    if (url.pathname === "/" || url.pathname === "/health") {
      return jsonResponse({ ok: true, service: "orange-connect-worker" });
    }

    // All /api/* requests are forwarded to ONE SignallingDurableObject instance.
    // That DO keeps all sessions in its storage (keyed by peerId).
    if (url.pathname.startsWith("/api/")) {
      const id = env.SIGNALLING_DO.idFromName("orange-connect-signalling");
      const obj = env.SIGNALLING_DO.get(id);
      return obj.fetch(request);
    }

    // Anything else = 404
    return jsonResponse({ error: "not-found", path: url.pathname }, 404);
  },
};
