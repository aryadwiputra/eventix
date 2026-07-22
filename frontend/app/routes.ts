import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  layout("components/layout/public-layout.tsx", [
    index("routes/landing.tsx"),
    route("events", "routes/events._index.tsx"),
    route("events/:eventId", "routes/events.$eventId.tsx"),
    route("checkout/:eventId", "routes/checkout.$eventId.tsx"),
    route("checkout/success/:code", "routes/checkout.success.$code.tsx"),
    route("dashboard/tickets", "routes/dashboard.tickets.tsx"),
    route("dashboard/tickets/:code", "routes/dashboard.tickets.$code.tsx"),
    route("auth/login", "routes/auth/login.tsx"),
    route("auth/register", "routes/auth/register.tsx"),
  ]),
  layout("components/layout/dashboard-layout.tsx", [
    route("admin", "routes/admin/_index.tsx"),
    route("admin/users", "routes/admin/users.tsx"),
    route("admin/roles", "routes/admin/roles.tsx"),
    route("admin/categories", "routes/admin/categories.tsx"),
    route("admin/transactions", "routes/admin/transactions.tsx"),
    route("organizer", "routes/organizer/_index.tsx"),
    route("organizer/events", "routes/organizer/events.tsx"),
    route("organizer/events/new", "routes/organizer/events/new.tsx"),
    route("organizer/events/:id", "routes/organizer/events/$id.tsx"),
    route("organizer/events/:id/tickets", "routes/organizer/events/$id/tickets.tsx"),
    route("organizer/transactions", "routes/organizer/transactions.tsx"),
  ]),
] satisfies RouteConfig;
