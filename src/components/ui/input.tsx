import * as React from 'react'
import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'w-full rounded border-2 border-ink bg-white px-4 py-2 font-body text-[13px] font-medium text-ink shadow-ink placeholder:text-on-surface-variant focus:shadow-ink-md focus:outline-none',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
