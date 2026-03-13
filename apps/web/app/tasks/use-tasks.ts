"use client";

import { useQuery } from "@tanstack/react-query";
import { get } from "@/lib/api";
import { type TaskWithRelations, listTasksQuerySchema } from "@workspace/shared";
import z from "zod";

type ListTasksQueryInput = z.input<typeof listTasksQuerySchema>;

export function useTasks(query?: ListTasksQueryInput) {
  return useQuery({
    queryKey: ["tasks", query],
    queryFn: () => get<TaskWithRelations, ListTasksQueryInput>("/tasks", { params: query }),
  });
}
