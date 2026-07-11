// Parameterized system-prompt builder: the A2UI catalog-authoring rules shared by every
// consumer (agenthud's live agent, ldnmxx's Founder's Copilot), with the app's own persona/task
// instructions supplied by the caller. No grant/founders-domain content lives here — the app
// passes that in as `domainInstructions`.
//
// A2UI_CATALOG_RULES below is agenthud's SYSTEM_PROMPT (src/agent/prompts.ts) with its
// app-framing sentence removed: it is a strict superset of ldnmxx's condensed A2UI_RULES
// (shared/prompt.ts) — same beginRendering/surfaceUpdate/root/acyclic-tree rules, plus the
// component shapes ldnmxx's condensed version omits (Image, Divider, Button, CheckBox, Slider,
// Tabs) and the dataModelUpdate seeding step. A model that follows the fuller reference also
// satisfies the condensed one, so "combining" the two sources means keeping the superset as the
// one shared reference rather than reconciling two diverging texts.

/** Model-facing description of the agent's single tool. */
export const RENDER_UI_TOOL_DESCRIPTION =
  "Draw the on-screen UI by emitting a batch of A2UI messages on the 'main' " +
  "surface. Use only the standard catalog component types.";

const A2UI_CATALOG_RULES = `An A2UI batch is an array of messages:
- { "beginRendering": { "surfaceId": "main", "root": "root" } }   (send first; "root" is the id of your TOP component)
- { "surfaceUpdate": { "surfaceId": "main", "components": [ ...Component ] } }
- { "dataModelUpdate": { "surfaceId": "main", "contents": [ { "key": "form", "valueMap": [ { "key": "agree", "valueBoolean": true } ] } ] } }   (OPTIONAL, send LAST — seeds initial values for path-bound CheckBox/Slider so they are interactive/toggleable)

A Component is { "id": string, "component": { <Type>: <props> } } with exactly one Type.
- CRITICAL: exactly ONE component must have id "root" — the top of the tree that beginRendering.root
  points at. If nothing has id "root", the surface renders blank. e.g. a single card UI →
  { "id": "root", "component": { "Card": { "child": "body" } } }, then define "body", etc.

Component shapes — match each Type's props EXACTLY:
- Text:     { "Text": { "text": { "literalString": "Hi" }, "usageHint": "h1|h2|h3|h4|h5|body|caption" } }
- Image:    { "Image": { "url": { "literalString": "asset:some-id" }, "usageHint": "icon|avatar|header" } }   (url AND usageHint REQUIRED — an Image without usageHint renders oversized; never invent asset ids the app hasn't supplied)
- Divider:  { "Divider": {} }   (optional: "axis": "horizontal|vertical", "thickness": 1)
- Row / Column / List hold MANY children: { "Column": { "children": { "explicitList": ["id1","id2"] } } }
- LAYOUT: for a dashboard or a set of peer items, make the root (or a section) a Row whose children are Columns/Cards — they render side by side (multi-column). Use a single Column only for a narrow, stacked layout.
- Card:     { "Card": { "child": "id" } }   (exactly ONE child id)
- Button:   { "Button": { "child": "id", "action": { "name": "doThing" } } }   (child = id of its label component, e.g. a Text; action is an OBJECT, not a string)
- CheckBox: { "CheckBox": { "label": { "literalString": "Agree" }, "value": { "path": "/form/agree" } } }   (bind value to a "path" + seed it via dataModelUpdate so it can be TOGGLED; a bare literalBoolean renders but is frozen)
- Slider:   { "Slider": { "value": { "path": "/form/level" }, "minValue": 0, "maxValue": 10 } }   (minValue/maxValue are PLAIN numbers; bind value to a "path" + seed it so the slider can MOVE)
- Tabs:     { "Tabs": { "tabItems": [ { "title": { "literalString": "Tab 1" }, "child": "id" } ] } }

Bound values are TYPED literals, never a bare "literal": strings → { "literalString": "..." }, numbers → { "literalNumber": 50 }, booleans → { "literalBoolean": true } (or a data path → { "path": "/x" }).
CRITICAL tree rules — break either and the surface fails to render:
1. Define EVERY id you reference (every child / explicitList entry / tabItems child) as its own component in the SAME call. No dangling references to ids you never define.
2. The tree must be ACYCLIC — a strict parent→child hierarchy. Never make a component reference itself or any of its ancestors (no a→b→a loops).
Never leave a children.explicitList, tabItems, or components list empty. Keep it to a handful of components.`;

export interface RenderUiPromptOptions {
  /** The app's own persona + task instructions, prepended before the shared A2UI rules. */
  domainInstructions: string;
  /** Name of the tool the model must call to render (match your ToolSpec.toolName). Defaults to "render_ui". */
  toolName?: string;
}

/** Build a full system prompt: the caller's domain instructions + the shared A2UI catalog rules,
 * parameterized by the forced tool name so an app can rename `render_ui` if its ToolSpec does. */
export function buildSystemPrompt(options: RenderUiPromptOptions): string {
  const toolName = options.toolName ?? "render_ui";
  return `${options.domainInstructions}

Answer by calling the \`${toolName}\` tool to draw an interface on the "main" surface with A2UI messages — never reply in prose alone. Make exactly ONE ${toolName} call with the COMPLETE interface (one beginRendering + one surfaceUpdate listing every component).

${A2UI_CATALOG_RULES}`;
}
