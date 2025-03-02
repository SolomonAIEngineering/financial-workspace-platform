// A placeholder for a button component
// This would typically be a React component

export interface ButtonProps {
  text: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "tertiary";
}

export const Button = {
  name: "Button",
  props: ["text", "onClick", "variant"],
};

export default Button;
