import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { CatalogViewer } from "../../src/react/CatalogViewer.js";

// Ported from agenthud-agui-a2ui's ui/tests/CatalogViewer.test.tsx — CatalogViewer is
// self-contained (no core-layer dependency), so this ports unchanged bar the import path.

const TITLE = "A2UI Standard Component Catalog";

function openModal() {
  render(<CatalogViewer />);
  fireEvent.click(screen.getByRole("button", { name: "Catalog" }));
  expect(screen.getByText(TITLE)).toBeInTheDocument();
}

describe("CatalogViewer modal", () => {
  it("closes on the close button", () => {
    openModal();

    fireEvent.click(screen.getByRole("button", { name: /close/i }));

    expect(screen.queryByText(TITLE)).toBeNull();
  });

  it("closes on Escape", () => {
    openModal();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByText(TITLE)).toBeNull();
  });

  it("closes on a backdrop (outside) click", () => {
    openModal();

    fireEvent.click(screen.getByTestId("catalog-backdrop"));

    expect(screen.queryByText(TITLE)).toBeNull();
  });

  it("does NOT close when clicking inside the dialog content", () => {
    openModal();

    fireEvent.click(screen.getByText(TITLE));

    expect(screen.getByText(TITLE)).toBeInTheDocument();
  });
});
