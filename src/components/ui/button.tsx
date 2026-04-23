import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 font-ui font-semibold border-[1.5px] border-ink rounded-pill transition-colors whitespace-nowrap select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground border-primary hover:opacity-90",
        outline: "bg-paper text-ink hover:bg-tint",
        secondary: "bg-secondary text-secondary-foreground hover:bg-tint",
        ghost: "border-transparent hover:bg-tint hover:text-ink",
        destructive: "bg-destructive/10 text-destructive border-destructive/40 hover:bg-destructive/20",
        link: "border-transparent underline-offset-4 hover:underline text-ink",
      },
      size: {
        xs: "h-6 px-2 text-xs",
        sm: "h-7 px-3 text-xs",
        default: "h-9 px-4 text-sm",
        lg: "h-12 px-5 text-base",
        icon: "size-8 rounded-[4px]",
        "icon-sm": "size-7 rounded-[4px]",
        "icon-lg": "size-10 rounded-[4px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
