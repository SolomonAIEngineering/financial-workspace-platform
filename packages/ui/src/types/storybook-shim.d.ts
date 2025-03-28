// This file contains type declarations to fix Storybook compatibility with React
import '@storybook/react';

declare module '@storybook/react' {
    // Fix for component property in Story annotations
    interface ComponentAnnotations<TFramework extends FrameworkName, ComponentType> {
        component?: any;
    }

    // Fix for args typing in Story annotations
    interface StoryAnnotations<TFramework extends FrameworkName, ComponentType> {
        args?: any;
        argTypes?: any;
    }
}

// Declare module augmentation for React FC types
declare module 'react' {
    // Make children optional in ReactPortal to avoid ReactElement assignment issues
    interface ReactPortal {
        children?: React.ReactNode;
    }
} 