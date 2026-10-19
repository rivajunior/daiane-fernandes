import { handleChallenge } from "~/lib/pow/handlers.server";
import { readConfig } from "~/lib/env.server";

export function loader() {
  return handleChallenge(readConfig(), Date.now());
}
