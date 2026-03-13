"use client"

import { type Task } from "@workspace/shared"
import { Checkbox } from "@workspace/ui/components/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@workspace/ui/components/field"

const Task = ({ task }: { task: Task }) => {
  return (
    <FieldLabel>
      <Field orientation="horizontal">
        <Checkbox
          id="toggle-checkbox-2"
          name="toggle-checkbox-2"
          onCheckedChange={(checked) => {
            console.log(checked)
          }}
          checked={task.status === "done"}
        />
        <FieldContent className={task.status === "done" ? "line-through" : ""}>
          <FieldTitle>{task.title}</FieldTitle>
          <FieldDescription>{task.description}</FieldDescription>
        </FieldContent>
      </Field>
    </FieldLabel>
  )
}

export default Task
