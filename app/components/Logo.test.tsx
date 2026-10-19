// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { expect, test } from "vite-plus/test";

import { Logo } from "./Logo";
import { SkipLink } from "./SkipLink";

test("Logo is an image named after Daiane and her role", () => {
  render(<Logo />);

  expect(
    screen.getByRole("img", { name: "Daiane Fernandes, Nutricionista Comportamental" }),
  ).toHaveAttribute("src", "/logo.svg");
});

test("Logo light variant uses the cream artwork for dark backgrounds", () => {
  render(<Logo variant="light" />);

  expect(screen.getByRole("img")).toHaveAttribute("src", "/logo-light.svg");
});

test("SkipLink targets the main content landmark", () => {
  render(<SkipLink />);

  expect(screen.getByRole("link", { name: "Pular para o conteúdo" })).toHaveAttribute(
    "href",
    "#conteudo",
  );
});
