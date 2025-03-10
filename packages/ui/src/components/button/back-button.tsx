import * as React from "react";

import { ArrowLeftCircleIcon } from "@heroicons/react/24/outline";
import { Button } from "../button";
import { ButtonProps } from "react-day-picker";
import { cn } from "../../utils/cn";

/*
 * BackButtonProps defines the props for the BackButton component.
 *
 * @interface BackButtonProps
 * @extends {ButtonProps}
 * */
interface BackButtonProps extends ButtonProps {
  callback: () => void;
  className?: string;
}

/**
 * BackButton is a component that renders a back button.
 *
 * @param {BackButtonProps} props - Props for the BackButton component.
 * @returns {JSX.Element} - The rendered BackButton component.
 */
const BackButton: React.FC<BackButtonProps> = ({ className, callback, ...props }) => {
  return (
    <Button
      className={cn(
        "my-3 flex flex-row gap-1 rounded-2xl bg-foreground text-foreground",
        className,
      )}
      onClick={callback}
      variant="outline"
    >
      <ArrowLeftCircleIcon className="mr-1 inline-block h-5 w-5 text-foreground" />
      <span className="cursor-pointer font-bold text-foreground hover:underline">
        Back
      </span>
    </Button>
  );
};

export { BackButton };
