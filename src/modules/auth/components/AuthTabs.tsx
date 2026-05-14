// src/modules/auth/components/AuthTabs.tsx

"use client";

import AuthView from "../views/AuthView";

type Props = {
  initialTab?: string;
};

export default function AuthTabs({ initialTab = "login" }: Props) {
  return <AuthView initialTab={initialTab} />;
}