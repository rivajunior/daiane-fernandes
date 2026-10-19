import { expect, test } from "vitest";

import { buildWhatsappUrl } from "./whatsapp";

test("buildWhatsappUrl encodes the pre-filled message", () => {
  expect(buildWhatsappUrl("5585900000000", "Olá, tudo bem?")).toBe(
    "https://wa.me/5585900000000?text=Ol%C3%A1%2C%20tudo%20bem%3F",
  );
});
