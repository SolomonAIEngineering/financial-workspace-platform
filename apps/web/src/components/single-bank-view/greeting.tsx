/**
 * Props interface for the Greeting component
 * 
 * @interface GreetingProps
 * @property {string} userName - The user's name to display in the greeting
 */
interface GreetingProps {
    userName: string;
}

/**
 * Greeting component displays a personalized welcome message
 * 
 * @component
 * @param {GreetingProps} props - Component props
 * @returns {JSX.Element} Heading with greeting text
 */
export function Greeting({ userName }: GreetingProps) {
    return (
        <h1 className="text-4xl font-semibold text-indigo-950 dark:text-white mb-12">
            Good morning, {userName}!
        </h1>
    );
} 