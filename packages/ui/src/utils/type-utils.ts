/**
 * Type utilities to help with React component compatibility
 */

/**
 * Safely cast any component type for Storybook compatibility
 * Use this when TypeScript complains about component types in stories
 */
export function asComponent<T>(component: T): any {
    return component;
}

/**
 * Safely cast props for Storybook when args or argTypes has compatibility issues
 */
export function asProps<T>(props: T): any {
    return props;
}

/**
 * Type assertion helper for ReactNode issues
 */
export function asReactNode(content: unknown): React.ReactNode {
    return content as React.ReactNode;
} 