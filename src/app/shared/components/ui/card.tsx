import * as React from "react"
import { cn } from "@/app/shared/lib/utils"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => <div ref={ref} className={cn("rounded-[var(--shape-16)] border border-border bg-card text-card-foreground shadow-[var(--elevation-card)]", className)} {...props} />)
Card.displayName = "Card"
const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => <h2 className={cn("font-[Merriweather,Georgia,serif] text-xl font-bold", className)} {...props} />
const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("p-6 pt-0", className)} {...props} />
const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div className={cn("flex items-center p-6 pt-0", className)} {...props} />
export { Card, CardHeader, CardTitle, CardContent, CardFooter }
