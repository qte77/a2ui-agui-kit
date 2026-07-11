import { A2UIMessageBatchSchema } from "./contract.js";
import type { AgentEvent, EventLogEntry } from "./events.js";

/*
 * Ported from agenthud-agui-a2ui's src/agent/applyA2UIEvent.ts. `EventLogEntry`/`AgentEvent`
 * moved to ./events.ts (the shared vocabulary); this module keeps only the render-injection
 * seam itself — do NOT hardcode any app-specific rendering here.
 */

/** Count components and collect catalog types from a single A2UI message object. */
function collectFromMessage(
  msg: Record<string, unknown>,
  types: Set<string>,
): number {
  let count = 0;
  const update = msg.surfaceUpdate as
    | { components?: { component?: Record<string, unknown> }[] }
    | undefined;
  if (update?.components) {
    for (const comp of update.components) {
      count++;
      if (comp.component) {
        const type = Object.keys(comp.component)[0];
        if (type) types.add(type);
      }
    }
  }
  if (msg.beginRendering) types.add("beginRendering");
  return count;
}

/** Summarize an A2UI batch for the log: component count + distinct catalog types. */
export function summarizeA2UI(messages: unknown[]): {
  count: number;
  types: string[];
} {
  const types = new Set<string>();
  let count = 0;
  for (const msg of messages as Record<string, unknown>[]) {
    count += collectFromMessage(msg, types);
  }
  return { count, types: [...types] };
}

/**
 * Apply one AG-UI-style event to the A2UI surface and return its log entry.
 *
 * The single seam shared by a replay engine and a live agent — both produce the same
 * {type, text, a2uiMessages} and render through one path. The A2UI payload is the EXTERNAL
 * contract: it is validated against A2UIMessageBatchSchema before it reaches `render`; an
 * invalid batch is logged and skipped (never partially rendered). `render` is injected so this
 * module stays free of any renderer coupling (e.g. @a2ui/react) — the consuming app supplies it.
 *
 * An event whose `type` is not part of the AG-UI vocabulary (events.ts's AGUI_EVENT_TYPES) is
 * not an error: it is returned as a plain log entry, same as any other non-A2UI lifecycle event.
 */
export function applyA2UIEvent(
  event: AgentEvent,
  timestamp: number,
  render: (messages: unknown[]) => void
): EventLogEntry {
  const entry: EventLogEntry = {
    type: event.type,
    timestamp,
    text: event.text,
  };

  if (!event.a2uiMessages) return entry;

  const parsed = A2UIMessageBatchSchema.safeParse(event.a2uiMessages);
  if (!parsed.success) {
    // Surface the violation in the event log instead of skipping silently (a blank surface with no
    // log entry once hid a live model emitting a batch that fails our contract). Mirrors the
    // render-error surfacing below.
    console.warn("A2UI contract violation — skipping render:", parsed.error.issues);
    const first = parsed.error.issues[0];
    entry.text = `A2UI contract violation (skipped): ${
      first ? `${first.path.join(".")} — ${first.message}` : "invalid batch"
    }`;
    return entry;
  }

  const info = summarizeA2UI(event.a2uiMessages);
  entry.a2uiComponentCount = info.count;
  entry.a2uiComponentTypes = info.types;

  try {
    render(event.a2uiMessages);
  } catch (e) {
    // Surface render failures (e.g. a renderer schema mismatch) in the event log instead of
    // silently blanking the surface — a silent swallow here once hid a Card `children` vs `child`
    // mismatch.
    const message = e instanceof Error ? e.message : String(e);
    console.error("A2UI render error:", e);
    entry.text = `A2UI render error: ${message}`;
  }
  return entry;
}
