/**
 * Centralized React type definitions for the application
 *
 * This file contains type definitions that are compatible with React 19 and can
 * be imported throughout the application to ensure consistent type usage.
 */

import { JSXElementConstructor, ReactElement, ReactNode } from 'react';

/** Export React 19 compatible types */
export type { ReactNode, ReactElement, JSXElementConstructor };

/** Common props interface for components that accept children */
export interface ChildrenProps {
  children: ReactNode;
}

/** Props interface for components that accept children with optional className */
export interface PropsWithChildrenAndClassName extends ChildrenProps {
  className?: string;
}
