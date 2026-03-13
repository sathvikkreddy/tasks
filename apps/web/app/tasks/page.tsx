"use client"

import TaskItem from "./task"
import { useTRPC } from "@/lib/trpc/client"
import { useSuspenseQuery } from "@tanstack/react-query"

const TasksPage = () => {
  const trpc = useTRPC()
  const { data } = useSuspenseQuery(trpc.tasks.list.queryOptions({}))

  return (
    <div className="mx-auto flex w-2/5 flex-col gap-2">
      {data.items.map((task) => (
        <TaskItem key={task.id} task={task} />
      ))}
    </div>
  )
}

export default TasksPage
