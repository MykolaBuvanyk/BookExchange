import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type FieldProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
};

type FieldMessageProps = HTMLAttributes<HTMLParagraphElement>;

export function Field({ className, children, ...props }: FieldProps) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {children}
    </div>
  );
}

export function FieldHint({ className, ...props }: FieldMessageProps) {
  return (
    <p className={cn("text-sm leading-6 text-zinc-400", className)} {...props} />
  );
}

export function FieldError({ className, ...props }: FieldMessageProps) {
  return (
    <p className={cn("text-sm leading-6 text-red-300", className)} {...props} />
  );
}
