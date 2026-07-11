import { describe, it, expect } from "vitest";
import { runChain, type Provider, type ToolSpec, type ToolCallResult } from "../src/providers.js";

// Adapted from ldnmxx-hack's worker/test/providers.test.ts. The Cloudflare Workers AI / fetch /
// OpenRouter / GitHub Models specifics and the render_ui specialisation (renderFree/RENDER_SPEC/
// buildProviders) are dropped along with them from src/providers.ts — see that file's header for
// the separation rationale. What's ported is the runtime-agnostic core: runChain's first-valid,
// all-fail, empty-chain and fallback-walk behavior, using a trivial in-memory ToolSpec/Provider
// (not render_ui) to prove the combinator isn't render-specific.

interface Echo {
  ok: boolean;
}

const echoSpec: ToolSpec<Echo> = {
  tool: { type: "function", function: { name: "echo" } },
  toolName: "echo",
  extract: (d) => d as Echo | null,
  validate: (v) => v.ok,
};

// A minimal, monomorphic test double: it always answers with `Echo`, so `tryCall`'s generic
// `T` is erased via a cast (the double is only ever exercised with `echoSpec`, i.e. T = Echo).
function provider(name: string, result: Echo | null): Provider {
  return {
    name,
    tryCall: <T>() =>
      Promise.resolve(result ? (({ value: result, model: name } as unknown) as ToolCallResult<T>) : null),
  };
}

describe("runChain (first-valid-wins provider combinator)", () => {
  it("returns the first provider that yields a non-null result (first-valid / fallback-walk)", async () => {
    const chain = [provider("a", null), provider("b", { ok: true }), provider("c", { ok: true })];

    const r = await runChain(chain, (p) => p.tryCall(echoSpec, { system: "s", user: "u" }));

    expect(r?.provider).toBe("b");
    expect(r?.result.value).toEqual({ ok: true });
  });

  it("walks past multiple failing providers before the one that succeeds (fallback-walk)", async () => {
    const chain = [
      provider("a", null),
      provider("b", null),
      provider("c", null),
      provider("d", { ok: true }),
    ];

    const r = await runChain(chain, (p) => p.tryCall(echoSpec, { system: "s", user: "u" }));

    expect(r?.provider).toBe("d");
  });

  it("returns null when every provider fails (all-fail)", async () => {
    const chain = [provider("a", null), provider("b", null)];

    const r = await runChain(chain, (p) => p.tryCall(echoSpec, { system: "s", user: "u" }));

    expect(r).toBeNull();
  });

  it("returns null for an empty provider chain (empty-chain)", async () => {
    const r = await runChain<Echo>([], () => Promise.resolve(null));

    expect(r).toBeNull();
  });

  it("runs an arbitrary ToolSpec through tryCall, proving the combinator is not render_ui-specific", async () => {
    const chain = [provider("only", { ok: true })];

    const r = await runChain(chain, (p) => p.tryCall(echoSpec, { system: "s", user: "u" }));

    expect(r?.result.model).toBe("only");
    expect(r?.result.value.ok).toBe(true);
  });
});
