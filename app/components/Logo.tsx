import { content } from "~/content/site";

type LogoProps = {
  variant?: "dark" | "light";
};

export function Logo({ variant = "dark" }: LogoProps) {
  return (
    <img
      className="logo"
      src={variant === "light" ? "/logo-light.svg" : "/logo.svg"}
      width="259"
      height="68"
      alt={`${content.name}, ${content.role}`}
    />
  );
}
