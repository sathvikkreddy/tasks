"use client"

import { useTasks } from "@/app/tasks/use-tasks"
import type { Task } from "@workspace/shared"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table"
import { Badge } from "@workspace/ui/components/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card"
import { Skeleton } from "@workspace/ui/components/skeleton"

const statusVariant: Record<
  Task["status"],
  "default" | "secondary" | "outline"
> = {
  todo: "outline",
  in_progress: "secondary",
  done: "default",
}

const statusLabel: Record<Task["status"], string> = {
  todo: "Todo",
  in_progress: "In Progress",
  done: "Done",
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function TaskListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  )
}

export function TaskList() {
  const { data, isLoading, isError, error } = useTasks()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks</CardTitle>
        <CardDescription>
          {data
            ? `${data.pagination.total} task${data.pagination.total !== 1 ? "s" : ""}`
            : "Loading tasks..."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading && <TaskListSkeleton />}

        {isError && (
          <div className="rounded-md border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
            Failed to load tasks: {error.message}
          </div>
        )}

        {data && data.items.length === 0 && (
          <div className="py-8 text-center text-sm text-muted-foreground">
            No tasks yet. Create one to get started.
          </div>
        )}

        {data && data.items.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell className="max-w-xs truncate text-muted-foreground">
                    {task.description || "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[task.status]}>
                      {statusLabel[task.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(task.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
