import { cn } from '@/lib/utils'

interface CardProps {
  className?: string
  children: React.ReactNode
}

export function Card({ className, children }: CardProps) {
  return (
    <div
      className={cn(
        'bg-surface border border-[#1F1F1F] rounded-sm p-6 transition-all duration-300 hover:border-gold/40 hover:scale-[1.02]',
        className
      )}
    >
      {children}
    </div>
  )
}
