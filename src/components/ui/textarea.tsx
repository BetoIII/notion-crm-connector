import * as React from "react"
import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.ComponentProps<"textarea">
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded border-2 border-input bg-white px-3 py-2 text-base font-body text-charcoal shadow-sm transition-all placeholder:text-smoke/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-glow focus-visible:border-amber-glow focus-visible:glow-amber disabled:cursor-not-allowed disabled:opacity-50 resize-y",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
