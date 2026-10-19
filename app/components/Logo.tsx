import "~/styles/logo.css";
import { content } from "~/content/site";

type LogoProps = {
  variant?: "horizontal" | "stacked";
};

export function Logo({ variant = "horizontal" }: LogoProps) {
  return (
    <span className={`logo logo--${variant}`}>
      <svg
        className="logo__mark"
        viewBox="0 0 48 48"
        width="48"
        height="48"
        aria-hidden="true"
        focusable="false"
      >
        <path
          fill="var(--color-sage)"
          d="M6 6h14c11 0 20 8 20 18S31 42 20 42H6V6Zm8 8v20h6c6 0 12-4 12-10S26 14 20 14h-6Z"
        />
        <path fill="var(--color-green)" d="M22 12h20v6H30v6h10v6H30v12h-8V12Z" />
        <path fill="var(--color-sage)" d="M26 38c-1-9 3-14 12-15-1 9-5 14-12 15Z" />
      </svg>
      <span className="logo__text">
        <span className="logo__name">{content.name}</span>
        <span className="logo__role">{content.role}</span>
      </span>
    </span>
  );
}
