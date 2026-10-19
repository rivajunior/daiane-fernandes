// @vitest-environment jsdom
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, test, vi } from "vite-plus/test";

import { CookieBanner } from "./CookieBanner";
import { loadAnalytics } from "~/lib/analytics";

vi.mock("~/lib/analytics", () => ({ loadAnalytics: vi.fn(), trackEvent: vi.fn() }));

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

test("renders nothing when no measurement id is configured", () => {
  const { container } = render(<CookieBanner />);

  expect(container).toBeEmptyDOMElement();
  expect(loadAnalytics).not.toHaveBeenCalled();
});

test("accepting stores consent, loads analytics and hides the banner", async () => {
  const user = userEvent.setup();
  render(<CookieBanner measurementId="G-TEST123" />);

  expect(await screen.findByRole("region", { name: "Cookies" })).toBeInTheDocument();
  expect(loadAnalytics).not.toHaveBeenCalled();

  await user.click(screen.getByRole("button", { name: "Aceitar" }));

  expect(localStorage.getItem("cookie-consent")).toBe("granted");
  expect(loadAnalytics).toHaveBeenCalledWith("G-TEST123");
  expect(screen.queryByRole("region", { name: "Cookies" })).not.toBeInTheDocument();
});

test("declining stores the choice and never loads analytics; preferences can reopen it", async () => {
  const user = userEvent.setup();
  render(<CookieBanner measurementId="G-TEST123" />);

  await user.click(await screen.findByRole("button", { name: "Recusar" }));

  expect(localStorage.getItem("cookie-consent")).toBe("denied");
  expect(loadAnalytics).not.toHaveBeenCalled();
  expect(screen.queryByRole("region", { name: "Cookies" })).not.toBeInTheDocument();

  window.dispatchEvent(new Event("open-cookie-preferences"));
  expect(await screen.findByRole("region", { name: "Cookies" })).toBeInTheDocument();
});

test("previously granted consent loads analytics without showing the banner", async () => {
  localStorage.setItem("cookie-consent", "granted");
  render(<CookieBanner measurementId="G-TEST123" />);

  await vi.waitFor(() => expect(loadAnalytics).toHaveBeenCalledWith("G-TEST123"));
  expect(screen.queryByRole("region", { name: "Cookies" })).not.toBeInTheDocument();
});
