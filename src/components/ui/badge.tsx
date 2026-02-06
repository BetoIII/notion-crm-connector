import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-sm px-2.5 py-1 text-xs font-bold font-body uppercase tracking-wide transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 shadow-md rotate-1 hover:rotate-0",
  {
    variants: {
      variant: {
        default:
          "border-l-2 border-amber-700 bg-amber-glow text-wood-dark hover:bg-amber-dim",
        secondary:
          "border-l-2 border-wood-dark bg-tan text-wood-dark hover:bg-wood-light",
        destructive:
          "border-l-2 border-red-800 bg-destructive text-destructive-foreground shadow hover:bg-destructive/90",
        outline: "border-2 border-wood-light bg-transparent text-charcoal hover:bg-tan/30",
        success: "border-l-2 border-green-800 bg-olive text-cream hover:opacity-90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
