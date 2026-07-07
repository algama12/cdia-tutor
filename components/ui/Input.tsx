import { forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          'w-full bg-elevated border border-border rounded-md',
          'px-3 py-2 text-sm text-text placeholder:text-text-faint',
          'focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'transition-colors duration-150',
          className
        )}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'
