// Public API of @qte77/a2ui-agui-kit (core, dependency-light layer). The React presentation
// layer (A2UISurface/CatalogViewer/EventStream/a2uiTheme) is a separate entry point —
// "@qte77/a2ui-agui-kit/react" (see src/react/index.ts) — plus flattened styles shipped as
// "@qte77/a2ui-agui-kit/styles.css" (see styles/a2ui.css). Keeping them out of this barrel lets
// a consumer use the core layer (contract validation, event vocabulary, providers) without
// pulling in React.

export * from "./contract.js";
export * from "./events.js";
export * from "./applyA2UIEvent.js";
export * from "./guard.js";
export * from "./renderTool.js";
export * from "./providers.js";
export * from "./prompt.js";
