// Netlify Function (v2) — serves /api/*. All logic lives in server/handler.mjs.
import { createHandler } from "../../server/handler.mjs";

const handle = createHandler();

export default async (request, context) => handle(request, { country: context?.geo?.country?.code });

export const config = { path: "/api/*" };
