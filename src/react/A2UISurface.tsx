import { A2UIProvider, A2UIRenderer, initializeDefaultCatalog } from "@a2ui/react";
import type { ReactNode } from "react";
import { qteA2uiTheme } from "./a2uiTheme.js";

/*
 * Ported from agenthud-agui-a2ui's ui/src/A2UISurface.tsx. The original coupled this component
 * to an app-specific module-level action bridge (agent/actionBridge.ts); the kit stays
 * transport-agnostic instead — a consumer passes its own `onAction` callback (or omits it for
 * a no-op), same as `@a2ui/react`'s own `A2UIProvider` contract.
 */

// Register the A2UI standard component catalog once at module load.
initializeDefaultCatalog();

export interface A2UISurfaceProviderProps {
  children: ReactNode;
  /** Called with the dispatched action's name (e.g. a clicked Button) so a consumer can route
   * it to its own agent/transport. Omit for a no-op — clicks simply do nothing. */
  onAction?: (actionName: string) => void;
}

export function A2UISurfaceProvider({ children, onAction }: A2UISurfaceProviderProps) {
  // Theme the rendered surface with the qte-* class hooks (see ./a2uiTheme.ts + styles/a2ui.css)
  // — the catalog is unstyled without this.
  return (
    <A2UIProvider theme={qteA2uiTheme} onAction={(m) => onAction?.(m.userAction?.name ?? "")}>
      {children}
    </A2UIProvider>
  );
}

export function A2UISurface({ fallback }: { fallback?: ReactNode }) {
  // `fallback` renders while the surface doesn't exist yet (e.g. a pending-render skeleton
  // between a run starting and the first render_ui batch). Spread keeps
  // exactOptionalPropertyTypes happy.
  return <A2UIRenderer surfaceId="main" {...(fallback !== undefined ? { fallback } : {})} />;
}
