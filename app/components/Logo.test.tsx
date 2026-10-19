// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { expect, test } from "vite-plus/test";

import { Logo } from "./Logo";
import { SkipLink } from "./SkipLink";

test("Logo exposes name and role as text and hides the decorative mark", () => {
  const { container } = render(<Logo variant="stacked" />);

  expect(screen.getByText("Daiane Fernandes")).toBeInTheDocument();
  expect(screen.getByText("Nutricionista Comportamental")).toBeInTheDocument();
  expect(container.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  expect(container.firstElementChild).toHaveClass("logo--stacked");
});

test("SkipLink targets the main content landmark", () => {
  render(<SkipLink />);

  expect(screen.getByRole("link", { name: "Pular para o conteúdo" })).toHaveAttribute(
    "href",
    "#conteudo",
  );
});
