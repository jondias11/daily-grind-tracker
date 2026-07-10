import { createFileRoute, redirect } from "@tanstack/react-router";
import { format } from "date-fns";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/day/$date", params: { date: format(new Date(), "yyyy-MM-dd") } });
  },
});
