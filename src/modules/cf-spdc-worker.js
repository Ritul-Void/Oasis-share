// Spdc worker - Cloudflare Worker + Durable Object (v2 — Symmetric Signaling)
// Both peers are equal participants. Either can share their code or enter the other's.
//
// Endpoints:
//  POST   /api/peer-offer          { peerId, offer }
//  GET    /api/peer-offer/:id      -> { peerId, offer }
//  POST   /api/peer-answer         { peerId, answer }
//  GET    /api/peer-answer/:id     -> { peerId, answer } or { pending }
//  POST   /api/session/:id/meta    { subnet }  — store participant metadata for LAN detection
//  GET    /api/session/:id/meta    -> { isLocalNetwork }
//  DELETE /api/session/:id         -> delete session
//
// Requires a Durable Object binding called SIGNALLING_DO.

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

// ---------- Helpers ----------

function extractSubnet(ip) {
  if (!ip) return null;
  // IPv4: take first 3 octets (e.g. "192.168.1")
  const v4 = ip.split(".");
  if (v4.length === 4) return v4.slice(0, 3).join(".");
  return null;
}

function getClientIp(request) {
  return (
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
    null
  );
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

    if (method === "OPTIONS") {
      return emptyResponse(204);
    }

    try {
      // POST /api/peer-offer
      if (pathname === "/api/peer-offer" && method === "POST") {
        const body = await request.json().catch(() => ({}));
        const { peerId, offer } = body;

        if (!peerId || !offer) {
          return jsonResponse({ error: "peerId and offer are required" }, 400);
        }

        const key = `session:${peerId}`;
        const existing = await this.state.storage.get(key);
        const session = {
          peerId,
          offer,
          answer: existing?.answer || null,
          createdAt: existing?.createdAt || Date.now(),
          participants: existing?.participants || [],
        };

        // Record the creator as a participant
        const ip = getClientIp(request);
        if (ip && !session.participants.find((p) => p.ip === ip)) {
          session.participants.push({ ip, role: "creator", ts: Date.now() });
        }

        await this.state.storage.put(key, session);
        return jsonResponse({ ok: true, peerId });
      }

      // GET /api/peer-offer/:peerId
      if (pathname.startsWith("/api/peer-offer/") && method === "GET") {
        const peerId = pathname.split("/").pop();
        const key = `session:${peerId}`;
        const session = await this.state.storage.get(key);

        if (!session || !session.offer) {
          return jsonResponse({ error: "offer-not-found", peerId }, 404);
        }

        return jsonResponse({ peerId: session.peerId, offer: session.offer });
      }

      // POST /api/peer-answer
      if (pathname === "/api/peer-answer" && method === "POST") {
        const body = await request.json().catch(() => ({}));
        const { peerId, answer } = body;

        if (!peerId || !answer) {
          return jsonResponse({ error: "peerId and answer are required" }, 400);
        }

        const key = `session:${peerId}`;
        const session = await this.state.storage.get(key);

        if (!session || !session.offer) {
          return jsonResponse({ error: "session-or-offer-not-found", peerId }, 404);
        }

        session.answer = answer;
        session.answeredAt = Date.now();

        // Record the joiner as a participant
        const ip = getClientIp(request);
        if (ip && !session.participants.find((p) => p.ip === ip)) {
          session.participants.push({ ip, role: "joiner", ts: Date.now() });
        }

        await this.state.storage.put(key, session);
        return jsonResponse({ ok: true, peerId });
      }

      // GET /api/peer-answer/:peerId
      if (pathname.startsWith("/api/peer-answer/") && method === "GET") {
        const peerId = pathname.split("/").pop();
        const key = `session:${peerId}`;
        const session = await this.state.storage.get(key);

        if (!session) {
          return jsonResponse({ error: "session-not-found", peerId }, 404);
        }

        if (!session.answer) {
          return jsonResponse({ pending: true, peerId }, 200);
        }

        return jsonResponse({ peerId: session.peerId, answer: session.answer });
      }

      // POST /api/session/:peerId/meta  — report participant metadata for LAN detection
      const metaMatch = pathname.match(/^\/api\/session\/([^/]+)\/meta$/);
      if (metaMatch && method === "POST") {
        const peerId = metaMatch[1];
        const key = `session:${peerId}`;
        const session = await this.state.storage.get(key);

        if (!session) {
          return jsonResponse({ error: "session-not-found", peerId }, 404);
        }

        const ip = getClientIp(request);
        if (ip && !session.participants.find((p) => p.ip === ip)) {
          session.participants.push({ ip, role: "unknown", ts: Date.now() });
          await this.state.storage.put(key, session);
        }

        return jsonResponse({ ok: true, peerId });
      }

      // GET /api/session/:peerId/meta  — check if peers are on the same local network
      if (metaMatch && method === "GET") {
        const peerId = metaMatch[1];
        const key = `session:${peerId}`;
        const session = await this.state.storage.get(key);

        if (!session) {
          return jsonResponse({ error: "session-not-found", peerId }, 404);
        }

        const subnets = session.participants
          .map((p) => extractSubnet(p.ip))
          .filter(Boolean);
        const uniqueSubnets = [...new Set(subnets)];
        const isLocalNetwork = subnets.length >= 2 && uniqueSubnets.length === 1;

        return jsonResponse({ peerId, isLocalNetwork, participantCount: session.participants.length });
      }

      // DELETE /api/session/:peerId  (cleanup)
      if (pathname.startsWith("/api/session/") && !pathname.includes("/meta") && method === "DELETE") {
        const peerId = pathname.split("/").pop();
        const key = `session:${peerId}`;
        await this.state.storage.delete(key);
        return jsonResponse({ ok: true, peerId });
      }

      if (pathname.startsWith("/api/")) {
        return jsonResponse({ error: "not-found", path: pathname }, 404);
      }

      return jsonResponse({ error: "invalid-endpoint-for-durable-object" }, 400);
    } catch (err) {
      return jsonResponse(
        { error: "internal-error", message: err?.message || String(err) },
        500
      );
    }
  }
}

// ---------- Main Worker ----------

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/" || url.pathname === "/health") {
      return jsonResponse({ ok: true, service: "spdc-connect-cf-worker-v2" });
    }

    if (url.pathname.startsWith("/api/")) {
      const id = env.SIGNALLING_DO.idFromName("spdc-connect-signalling");
      const obj = env.SIGNALLING_DO.get(id);
      return obj.fetch(request);
    }

    return jsonResponse({ error: "not-found", path: url.pathname }, 404);
  },
};
