import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "../utils";
import { Button, type ButtonProps } from "./button";

export interface SubmitButtonProps extends ButtonProps {
  children: React.ReactNode;
  isSubmitting?: boolean;
}

export function SubmitButton({
  children,
  isSubmitting = false,
  disabled,
  ...props
}: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      disabled={isSubmitting || disabled}
      {...props}
      className={cn(props.className, "relative")}
    >
      <span className={cn({ "opacity-0": isSubmitting })}>{children}</span>

      {isSubmitting && (
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Loader2 className="h-4 w-4 animate-spin" />
        </span>
      )}
    </Button>
  );
}
