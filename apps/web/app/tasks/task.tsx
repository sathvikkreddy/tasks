"use client"

import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@workspace/ui/components/field"
import type { RouterOutputs } from "@workspace/trpc"

type TaskItemProps = {
  task: RouterOutputs["tasks"]["list"]["items"][number]
}

const TaskItem = ({ task }: TaskItemProps) => {
  return (
    <FieldLabel>
      <Field orientation="horizontal">
        <Checkbox
          id={`task-${task.id}`}
          name={`task-${task.id}`}
          checked={task.status === "done"}
          onCheckedChange={(checked) => console.log(checked)}
        />
        <FieldContent className={task.status === "done" ? "line-through" : ""}>
          <FieldTitle>{task.title}</FieldTitle>
          <FieldDescription>{task.description}</FieldDescription>
        </FieldContent>
      </Field>
    </FieldLabel>
  )
}

export default TaskItem
