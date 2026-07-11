/*
 * The AG-UI event-type vocabulary shared across replay + live-agent paths, and the event-log
 * entry format both produce. Ported from agenthud-agui-a2ui's src/agent/applyA2UIEvent.ts
 * (EventLogEntry, AgentEvent, appendLogEntry) and kept as the single source of truth so
 * applyA2UIEvent.ts (the render-injection seam) can import rather than redefine them.
 *
 * `AgentEvent.type` / `EventLogEntry.type` stay plain `string`, not a union of
 * AGUI_EVENT_TYPES — a consumer app is free to emit its own bespoke event types (e.g. a
 * "USAGE" telemetry event) alongside the standard AG-UI vocabulary; see applyA2UIEvent's
 * extensibility test.
 */

/** The AG-UI event-type vocabulary this kit understands out of the box. Any other string `type`
 * a consumer emits is still logged (see applyA2UIEvent) — just without AG-UI-specific handling. */
export const AGUI_EVENT_TYPES = [
  "RUN_STARTED",
  "RUN_FINISHED",
  "RUN_ERROR",
  "TEXT_MESSAGE_START",
  "TEXT_MESSAGE_CONTENT",
  "TEXT_MESSAGE_END",
  "TOOL_CALL_START",
  "TOOL_CALL_ARGS",
  "TOOL_CALL_END",
] as const;

export type AGUIEventType = (typeof AGUI_EVENT_TYPES)[number];

/** One log row in the AG-UI event stream (e.g. a UI's event-log panel or an SSE audit trail). */
export interface EventLogEntry {
  type: string;
  timestamp: number;
  // exactOptionalPropertyTypes: allow explicit undefined so callers can spread {text: maybeStr}
  text?: string | undefined;
  a2uiComponentCount?: number | undefined;
  a2uiComponentTypes?: string[] | undefined;
}

/** Minimal shape shared by replayed events and live AG-UI events. */
export interface AgentEvent {
  type: string;
  // exactOptionalPropertyTypes: allow explicit undefined (e.g. toolName may be absent)
  text?: string | undefined;
  a2uiMessages?: unknown[] | undefined;
}

/**
 * Append a log entry, coalescing consecutive `TEXT_MESSAGE_CONTENT` deltas into one row.
 * A streaming agent emits many tiny text deltas; merging them keeps the event log readable
 * (one row per message, not per token). Immutable — returns a new array (and a new merged
 * entry), never mutating `log` or the entries already held in caller state (e.g. React state).
 */
export function appendLogEntry(
  log: EventLogEntry[],
  entry: EventLogEntry
): EventLogEntry[] {
  const last = log[log.length - 1];
  if (entry.type === "TEXT_MESSAGE_CONTENT" && last?.type === "TEXT_MESSAGE_CONTENT") {
    // Spread `last` so the merged row keeps the first delta's timestamp.
    const merged: EventLogEntry = { ...last, text: (last.text ?? "") + (entry.text ?? "") };
    return [...log.slice(0, -1), merged];
  }
  return [...log, entry];
}
