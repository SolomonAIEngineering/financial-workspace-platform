interface GreetingProps {
    userName: string;
}

export function Greeting({ userName }: GreetingProps) {
    return (
        <h1 className="text-4xl font-semibold text-indigo-950 dark:text-white mb-12">
            Good morning, {userName}!
        </h1>
    );
} 