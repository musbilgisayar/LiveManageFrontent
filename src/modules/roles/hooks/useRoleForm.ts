"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const schema = z.object({
  name: z.string().min(2, "Role name is required"),
  description: z.string().optional(),
});

export function useRoleForm(initial?: { name?: string; description?: string }) {
  return useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: initial?.name ?? "",
      description: initial?.description ?? "",
    },
  });
}
