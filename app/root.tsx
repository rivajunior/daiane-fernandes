import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";

import type { Route } from "./+types/root";
import { SkipLink } from "./components/SkipLink";
import styles from "./styles/main.css?inline";

export const links: Route.LinksFunction = () => [
  { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
  ...["fraunces-latin-wght-normal", "jost-latin-wght-normal"].map((file) => ({
    rel: "preload",
    href: `/fonts/${file}.woff2`,
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous" as const,
  })),
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <style dangerouslySetInnerHTML={{ __html: styles }} />
      </head>
      <body>
        <SkipLink />
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  const isNotFound = isRouteErrorResponse(error) && error.status === 404;

  return (
    <main>
      <h1>{isNotFound ? "Página não encontrada" : "Algo deu errado"}</h1>
      <p>
        {isNotFound
          ? "O endereço que você tentou abrir não existe."
          : "Tente novamente em instantes."}
      </p>
    </main>
  );
}
