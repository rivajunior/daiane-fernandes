import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("api/pow/challenge", "routes/api.pow.challenge.ts"),
  route("api/pow/verify", "routes/api.pow.verify.ts"),
] satisfies RouteConfig;
