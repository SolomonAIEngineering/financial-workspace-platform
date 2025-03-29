import 'react';

declare module 'react' {
    interface ReactPortal {
        // Make children optional to make ReactElement assignable to ReactNode
        children?: ReactNode;
    }

    // Expand ReactNode to be more permissive
    type ReactNode =
        | ReactElement
        | string
        | number
        | Iterable<ReactNode>
        | ReactPortal
        | boolean
        | null
        | undefined;
} 