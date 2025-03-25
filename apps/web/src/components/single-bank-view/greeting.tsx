/**
 * Props interface for the Greeting component
 *
 * @property {string} userName - The user's name to display in the greeting
 * @interface GreetingProps
 */
interface GreetingProps {
  userName: string;
}

/**
 * Greeting component displays a personalized welcome message
 *
 * @param {GreetingProps} props - Component props
 * @returns {JSX.Element} Heading with greeting text
 * @component
 */
export function Greeting({ userName }: GreetingProps) {
  return (
    <h1 className="mb-12 text-4xl font-semibold text-indigo-950 dark:text-white">
      Good morning, {userName}!
    </h1>
  );
}
