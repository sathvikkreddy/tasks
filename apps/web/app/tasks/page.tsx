"use client"

import { useTasks } from "@/app/tasks/use-tasks"
import React from "react"
import Task from "./task"

const TasksPage = () => {
  const { data, isLoading, isError, error } = useTasks()

  if (isError || isLoading) {
    return "Wait"
  }

  return (
    <div className="mx-auto flex w-2/5 flex-col gap-2">
      {data?.items?.map((task) => (
        <Task key={task.id} task={task} />
      ))}
    </div>
  )
}

export default TasksPage
