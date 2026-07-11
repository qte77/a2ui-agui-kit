// Runtime-agnostic provider + tool-call contract, extracted from ldnmxx-hack's
// worker/src/agent/providers.ts + worker/src/agent/model.ts.
//
// DECISION: this file deliberately keeps ONLY the shape + combinator — `ToolSpec`, `Provider`,
// `runChain` — and drops everything runtime-specific from the source: the Cloudflare Workers AI
// binding call (`workersAiProvider`), the OpenRouter/GitHub Models `fetch`-based callers
// (`openRouterFreeProvider`, `githubModelsProvider`, `callModelTool`), the OpenAI-compatible
// response parsing (`ORResponse`/`extractToolArgs`/`extractBatch`), the render_ui specialisation
// (`tryRender`/`renderFree`/`RENDER_SPEC`), and the env-driven factory (`buildProviders`). Those
// all encode a specific HTTP/binding transport and a specific response shape — an app wires its
// own callers behind `Provider.tryCall` and imports RENDER_UI_TOOL/isSelfContainedBatch from
// ./renderTool.js to build its own render-flavoured ToolSpec. What's left here has zero
// dependencies and zero I/O: a chain of black-box callers, tried in order, first valid result
// wins.

/** A forced tool + how to pull and validate its structured output. One ToolSpec (e.g. a
 * render_ui spec built from ./renderTool's RENDER_UI_TOOL + isSelfContainedBatch) can run
 * through any Provider that implements `tryCall`. */
export interface ToolSpec<T> {
  tool: unknown; // JSON tool schema, e.g. RENDER_UI_TOOL
  toolName: string; // forced tool_choice name + the arguments key to extract
  extract: (data: unknown) => T | null;
  validate: (value: T) => boolean;
}

/** Args a provider needs to make one forced-tool call. Kept minimal and transport-agnostic. */
export interface CallArgs {
  system: string;
  user: string;
  signal?: AbortSignal;
}

/** A validated tool-call result: the parsed value, which model produced it, and (optionally) its
 * token usage. */
export interface ToolCallResult<T> {
  value: T;
  model: string;
  usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number };
}

/** One model/runtime backend willing to run a forced ToolSpec. Concrete implementations
 * (Cloudflare Workers AI, OpenRouter, GitHub Models, ...) live in the consuming app; this kit
 * only depends on the shape, so any backend the app injects can be chained via `runChain`. */
export interface Provider {
  name: string; // identifies which provider answered (e.g. for a trace span's `model:<name>`)
  tryCall<T>(spec: ToolSpec<T>, args: CallArgs): Promise<ToolCallResult<T> | null>;
}

/**
 * Generic first-valid-wins chain: run `call` on each provider in order until one returns a
 * non-null result; null if every provider fails (or the chain is empty) so the caller can fall
 * back to its own deterministic default. Returns which provider won so the caller can
 * attribute/trace it. Ported from ldnmxx-hack's `runChain` — already runtime-agnostic in the
 * source (no fetch/Cloudflare coupling), unlike the render-specialised `renderFree` it also
 * defined (dropped here — see the file header).
 */
export async function runChain<T>(
  providers: Provider[],
  call: (p: Provider) => Promise<T | null>
): Promise<{ result: T; provider: string } | null> {
  for (const p of providers) {
    const result = await call(p);
    if (result) return { result, provider: p.name };
  }
  return null;
}
