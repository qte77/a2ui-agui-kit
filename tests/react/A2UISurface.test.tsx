/**
 * Smoke test: renders with the REAL @a2ui/react renderer (no mock), so a future @a2ui/react
 * bump that breaks the catalog -> message-processor -> renderer -> Text path is caught in CI.
 *
 * Ported from agenthud-agui-a2ui's ui/tests/A2UISurface.test.tsx, adapted for the kit's
 * transport-agnostic `onAction` prop (the original coupled to an app-specific module-level
 * action bridge). The "renders every recorded value-bound leaf component" test is dropped — it
 * depended on an app-specific recordings/overview.json fixture that has no kit equivalent; the
 * underlying typed-literal binding contract is already covered by the core layer's
 * contract.test.ts.
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, act, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { useA2UIActions } from "@a2ui/react";
import { A2UISurfaceProvider, A2UISurface } from "../../src/react/A2UISurface.js";

const SMOKE_TEXT = "SmokeTestUniqueText__a2ui";
const BUTTON_LABEL = "SmokeButton__a2ui";

// Minimal batch with one actionable Button wrapping a Text label.
const BUTTON_BATCH = [
  { beginRendering: { surfaceId: "main", root: "b1" } },
  {
    surfaceUpdate: {
      surfaceId: "main",
      components: [
        {
          id: "b1",
          component: { Button: { child: "t1", action: { name: "do_thing" } } },
        },
        {
          id: "t1",
          component: { Text: { text: { literalString: BUTTON_LABEL }, usageHint: "body" as const } },
        },
      ],
    },
  },
];

// Smallest valid A2UI batch that renders one Text component on surface "main".
const MINIMAL_BATCH = [
  { beginRendering: { surfaceId: "main", root: "t1" } },
  {
    surfaceUpdate: {
      surfaceId: "main",
      components: [
        {
          id: "t1",
          component: { Text: { text: { literalString: SMOKE_TEXT }, usageHint: "body" as const } },
        },
      ],
    },
  },
];

/** Grabs processMessages from inside the provider and hands it back out. */
function CaptureActions({
  onReady,
}: {
  onReady: (fn: ReturnType<typeof useA2UIActions>["processMessages"]) => void;
}) {
  onReady(useA2UIActions().processMessages);
  return null;
}

describe("A2UISurface (real @a2ui/react)", () => {
  it("forwards a clicked Button's action name to the onAction prop", () => {
    // ARRANGE
    const onAction = vi.fn();
    let processMessages!: ReturnType<typeof useA2UIActions>["processMessages"];
    render(
      <A2UISurfaceProvider onAction={onAction}>
        <CaptureActions onReady={(fn) => (processMessages = fn)} />
        <A2UISurface />
      </A2UISurfaceProvider>,
    );
    act(() => processMessages(BUTTON_BATCH));

    // ACT — click the rendered A2UI Button
    fireEvent.click(screen.getByText(BUTTON_LABEL));

    // ASSERT — the provider forwarded the action name to our prop
    expect(onAction).toHaveBeenCalledWith("do_thing");
  });

  it("does not throw when onAction is omitted (no-op default)", () => {
    let processMessages!: ReturnType<typeof useA2UIActions>["processMessages"];
    render(
      <A2UISurfaceProvider>
        <CaptureActions onReady={(fn) => (processMessages = fn)} />
        <A2UISurface />
      </A2UISurfaceProvider>,
    );
    act(() => processMessages(BUTTON_BATCH));

    expect(() => fireEvent.click(screen.getByText(BUTTON_LABEL))).not.toThrow();
  });

  it("renders a Text component's literal text", () => {
    let processMessages!: ReturnType<typeof useA2UIActions>["processMessages"];

    render(
      <A2UISurfaceProvider>
        <CaptureActions onReady={(fn) => (processMessages = fn)} />
        <A2UISurface />
      </A2UISurfaceProvider>,
    );

    // Empty surface before any messages.
    expect(screen.queryByText(SMOKE_TEXT)).toBeNull();

    // Drive the real renderer with a minimal batch (render is synchronous — Text is an eager
    // catalog component).
    act(() => processMessages(MINIMAL_BATCH));

    expect(screen.getByText(SMOKE_TEXT)).toBeInTheDocument();
  });
});
