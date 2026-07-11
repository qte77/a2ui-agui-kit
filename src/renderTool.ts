// The forced `render_ui` tool schema + a dependency-free structural validator for the A2UI batch
// an agent returns. Ported verbatim from ldnmxx-hack's shared/renderTool.ts (its
// domain/app-specific grant/founders card builders live in the app, not here). Plain TS — no
// zod. The validator is a cheap, ADDITIONAL safety invariant (self-containment: every
// referenced id is defined, and a root exists) on top of contract.ts's structural schema —
// reject a malformed batch here so callers can fall back to a deterministic default instead of
// surfacing a broken UI.

export const RENDER_UI_TOOL = {
  type: "function",
  function: {
    name: "render_ui",
    description:
      "Draw the on-screen UI by emitting a batch of A2UI messages on the 'main' surface.",
    parameters: {
      type: "object",
      properties: { messages: { type: "array", items: { type: "object" } } },
      required: ["messages"],
    },
  },
};

interface BatchComponent {
  id?: unknown;
  component?: Record<string, { child?: unknown; children?: { explicitList?: unknown } }>;
}
interface BatchMessage {
  beginRendering?: { root?: unknown };
  surfaceUpdate?: { components?: unknown };
}

/** Register one component's id and collect the child ids it references (Card.child + explicitList). */
function collectComponent(comp: unknown, ids: Set<string>, refs: string[]): void {
  const c = comp as BatchComponent;
  if (typeof c.id === "string") ids.add(c.id);
  if (!c.component) return;
  const props = Object.values(c.component)[0];
  const card = c.component.Card;
  if (card && typeof card.child === "string") refs.push(card.child);
  const list = props?.children?.explicitList;
  if (Array.isArray(list)) for (const x of list) if (typeof x === "string") refs.push(x);
}

/** Fold one message's components into the running ids/refs accumulators; return its declared
 * root, if any. Split out of isSelfContainedBatch to keep both functions under the complexity
 * budget (this repo's eslint enforces it; ldnmxx-hack — this function's source — runs no lint). */
function collectMessage(msg: unknown, ids: Set<string>, refs: string[]): string | undefined {
  const m = msg as BatchMessage;
  const comps = m.surfaceUpdate?.components;
  if (Array.isArray(comps)) for (const comp of comps) collectComponent(comp, ids, refs);
  return typeof m.beginRendering?.root === "string" ? m.beginRendering.root : undefined;
}

// Structural self-containment guard: root defined + in ids, every referenced child id (Card.child +
// Column explicitList) defined.
export function isSelfContainedBatch(batch: unknown): batch is unknown[] {
  if (!Array.isArray(batch)) return false;
  let root: string | undefined;
  const ids = new Set<string>();
  const refs: string[] = [];
  for (const msg of batch) {
    root = collectMessage(msg, ids, refs) ?? root;
  }
  if (!root || !ids.has(root)) return false;
  return refs.every((r) => ids.has(r));
}
