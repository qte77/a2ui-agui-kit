import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { EventStream } from "../../src/react/EventStream.js";
import type { EventLogEntry } from "../../src/events.js";

const EVENTS: EventLogEntry[] = [
  { type: "RUN_STARTED", timestamp: 0 },
  { type: "RUN_FINISHED", timestamp: 1234 },
];

describe("EventStream renderExtra", () => {
  it("renders renderExtra(entry) output for each entry when the prop is provided", () => {
    render(
      <EventStream
        events={EVENTS}
        renderExtra={(entry) => <span data-testid="extra">{entry.type}-extra</span>}
      />,
    );

    const extras = screen.getAllByTestId("extra");
    expect(extras).toHaveLength(EVENTS.length);
    expect(extras[0]).toHaveTextContent("RUN_STARTED-extra");
    expect(extras[1]).toHaveTextContent("RUN_FINISHED-extra");
  });

  it("renders nothing extra when renderExtra is omitted (default behavior unchanged)", () => {
    render(<EventStream events={EVENTS} />);

    expect(screen.queryByTestId("extra")).toBeNull();
  });
});
