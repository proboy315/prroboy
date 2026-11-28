// Vercel Function (Node.js runtime) — catch-all for /api/*. All logic lives in server/handler.mjs.
import { createHandler } from "../server/handler.mjs";

const handle = createHandler();

export default {
  fetch(request) {
    return handle(request);
  },
};
