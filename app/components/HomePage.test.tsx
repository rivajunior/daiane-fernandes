// @vitest-environment jsdom
import { render } from "@testing-library/react";
import { expect, test } from "vitest";

import { HomePage } from "./HomePage";

const whatsappUrl = "https://wa.me/5585900000000?text=Ol%C3%A1";

test("home page has one h1, ordered section headings and only wa.me contact links", () => {
  const { container } = render(<HomePage whatsappUrl={whatsappUrl} />);

  expect(container.querySelectorAll("h1")).toHaveLength(1);
  expect(Array.from(container.querySelectorAll("h2"), (heading) => heading.textContent)).toEqual([
    "Sobre Daiane",
    "Quero ajudar você que vive",
    "Um olhar além do prato",
    "Encontros 100% online",
    "Simples, seguras e pensadas para você",
    "Você não precisa passar por isso sozinho.",
  ]);
  expect(container.querySelector("main#conteudo")).not.toBeNull();

  const whatsappLinks = Array.from(container.querySelectorAll('a[href^="https://wa.me/"]')).filter(
    (link) => !link.closest("noscript"),
  );
  expect(whatsappLinks).toHaveLength(4);

  const visible = container.cloneNode(true) as HTMLElement;
  visible.querySelectorAll("noscript").forEach((element) => element.remove());
  const text = visible.textContent ?? "";
  expect(text).not.toContain("@");
  expect(text).not.toContain("5585900000000");
});
