// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import { expect, test } from "vitest";

import { WhatsappButton, WhatsappUrlContext } from "./WhatsappButton";

test("WhatsappButton links to the provided url safely and records its section", () => {
  render(
    <WhatsappUrlContext value="https://wa.me/5585900000000?text=Ol%C3%A1">
      <WhatsappButton section="hero">Começar meu acompanhamento</WhatsappButton>
    </WhatsappUrlContext>,
  );

  const link = screen.getByRole("link", { name: /Começar meu acompanhamento/ });
  expect(link).toHaveAttribute("href", "https://wa.me/5585900000000?text=Ol%C3%A1");
  expect(link).toHaveAttribute("target", "_blank");
  expect(link).toHaveAttribute("rel", "noopener noreferrer");
  expect(link).toHaveAttribute("data-section", "hero");
});
