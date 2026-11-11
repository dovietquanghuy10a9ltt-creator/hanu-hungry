"use client";

import type { ReactNode } from "react";
import { useAuth } from "@/components/auth/auth-context";

export function HomeViewSwitcher({
  guestView,
  studentView,
}: {
  guestView: ReactNode;
  studentView: ReactNode;
}) {
  const { authenticated } = useAuth();

  if (authenticated) {
    return <>{studentView}</>;
  }

  return <>{guestView}</>;
}
