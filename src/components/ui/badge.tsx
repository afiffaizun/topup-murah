import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded border-2 border-ink px-2 py-0.5 font-body text-[11px] font-bold uppercase leading-[14px] tracking-[0.06em] whitespace-nowrap shadow-ink-sm',
  {
    variants: {
      variant: {
        default: 'bg-pop-yellow text-ink',
        secondary: 'bg-pop-cyan text-ink',
        destructive: 'bg-pop-magenta text-white',
        outline: 'bg-white text-ink',
        soft: 'bg-pop-cyan-soft text-pop-cyan-ink border shadow-none',
        plain: 'bg-pop-cyan-soft text-pop-cyan-ink border shadow-none',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

function Badge({ className, variant, ...props }: React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
