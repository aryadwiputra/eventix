import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  layout("components/layout/public-layout.tsx", [
    index("routes/landing.tsx"),
    route("events/:eventId", "routes/events.$eventId.tsx"),
    route("checkout/:eventId", "routes/checkout.$eventId.tsx"),
    route("checkout/success/:code", "routes/checkout.success.$code.tsx"),
    route("auth/login", "routes/auth/login.tsx"),
    route("auth/register", "routes/auth/register.tsx"),
  ]),
] satisfies RouteConfig;
