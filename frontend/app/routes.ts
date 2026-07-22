import { type RouteConfig, index, layout } from "@react-router/dev/routes";

export default [
  layout("components/layout/public-layout.tsx", [
    index("routes/landing.tsx"),
  ]),
] satisfies RouteConfig;
