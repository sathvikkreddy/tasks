"use client"

export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div>
      <p>Failed to load tasks</p>
      <button onClick={reset}>Try again</button>
    </div>
  )
}
