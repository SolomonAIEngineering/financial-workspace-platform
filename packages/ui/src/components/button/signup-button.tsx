import * as React from "react";

import { Button } from "../button";
import { ButtonProps } from "react-day-picker";
import { LockClosedIcon } from "@heroicons/react/24/outline";
import { cn } from "../../utils/cn";

/*
 * SignUpButtonProps defines the props for the SignUpButton component.
 *
 * @interface SignUpButtonProps
 * @extends {ButtonProps}
 * */
interface SignUpButtonProps extends ButtonProps {
  callBack: () => void;
  className?: string;
}

/**
 * SignUpButton is a component that renders a sign up button.
 *
 * @param {SignUpButtonProps} props - Props for the SignUpButton component.
 * @returns {JSX.Element} - The rendered SignUpButton component.
 */
const SignUpButton: React.FC<SignUpButtonProps> = ({ className, callBack }) => {
  return (
    <Button
      className={cn(
        "rounded-2xl border-zinc-950 bg-zinc-950 font-bold text-foreground",
        className,
      )}
      variant="outline"
      onClick={callBack}
    >
      <LockClosedIcon className="mr-2 h-5 w-5 text-foreground" />
      Sign Up
    </Button>
  );
};

export { SignUpButton };
