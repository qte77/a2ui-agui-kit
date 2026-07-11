import { useEffect, useRef, type ReactNode } from "react";
import type { EventLogEntry } from "../events.js";

// Ported from agenthud-agui-a2ui's ui/src/EventStream.tsx. `EventLogEntry` now lives in the core
// layer's events.ts (the shared vocabulary) instead of an app-specific agent module; re-exported
// here as a convenience so a consumer of the ./react entry point doesn't also need to import the
// package root.
export type { EventLogEntry };

export interface EventStreamProps {
  events: EventLogEntry[];
  /**
   * Optional per-entry extra content, rendered after this entry's built-in row. Lets a consumer
   * (e.g. a USAGE telemetry status chip) append its own bespoke rendering without forking this
   * component. Omit for the default behavior (nothing extra rendered).
   */
  renderExtra?: (entry: EventLogEntry) => ReactNode;
}

// Zero-blue badges — TEXT_MESSAGE reads neutral, not the library's default blue.
function badgeColor(type: string): string {
  if (type.startsWith("RUN_")) return "bg-data-positive/15 text-data-positive";
  if (type.startsWith("TEXT_MESSAGE")) return "bg-text-muted/15 text-text-muted";
  if (type.startsWith("TOOL_CALL")) return "bg-primary/15 text-primary";
  if (type.startsWith("STEP_")) return "bg-data-caution/15 text-data-caution";
  return "bg-text-muted/15 text-text-muted";
}

function formatTime(ms: number): string {
  return (ms / 1000).toFixed(2).padStart(7, " ") + "s";
}

export function EventStream({ events, renderExtra }: EventStreamProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [events.length]);

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto bg-surface font-mono text-xs p-2 space-y-1.5"
    >
      {events.length === 0 && (
        <p className="text-text-muted">
          Run a prompt to see the live event stream.
        </p>
      )}
      {events.map((entry, i) => (
        <div key={i}>
          <div className="flex items-start gap-2">
            <span className="shrink-0 text-text-muted whitespace-pre">
              {formatTime(entry.timestamp)}
            </span>
            <span
              className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${badgeColor(entry.type)}`}
            >
              {entry.type}
            </span>
            {entry.text && (
              <span className="text-text break-words">{entry.text}</span>
            )}
          </div>
          {entry.a2uiComponentTypes && entry.a2uiComponentTypes.length > 0 && (
            <div className="ml-[7.5ch] pl-2 mt-0.5 border-l border-primary">
              <span className="text-primary text-[10px]">
                processMessages →{" "}
              </span>
              <span className="text-text-muted text-[10px]">
                {entry.a2uiComponentCount} components, {entry.a2uiComponentTypes.length} types:{" "}
              </span>
              <span className="text-primary text-[10px]">
                {entry.a2uiComponentTypes.join(", ")}
              </span>
            </div>
          )}
          {renderExtra?.(entry)}
        </div>
      ))}
    </div>
  );
}
