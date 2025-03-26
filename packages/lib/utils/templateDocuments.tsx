import { aiValue, blockMenuValue, calloutValue, copilotValue, equationValue, floatingToolbarValue, mediaToolbarValue, slashMenuValue, tocValue, uploadValue } from '@solomonai/templates';

/* eslint-disable perfectionist/sort-objects */
import type { Value } from '@udecode/plate';

export interface TemplateDocument {
  id: string;
  icon: string | null;
  title: string | null;
  value: Value;
}

const templates: Record<string, TemplateDocument> = {
  playground: {
    id: 'playground',
    icon: '🌳',
    title: 'Playground',
    value: [
      ...tocValue,
      ...aiValue,
      ...copilotValue,
      ...calloutValue,
      ...equationValue,
      ...uploadValue,
      ...slashMenuValue,
      ...blockMenuValue,
      ...floatingToolbarValue,
      ...mediaToolbarValue,
    ],
  },
  ai: {
    id: 'ai',
    icon: '🧠',
    title: 'AI',
    value: aiValue,
  },
  copilot: {
    id: 'copilot',
    icon: '🤖',
    title: 'Copilot',
    value: copilotValue,
  },
  callout: {
    id: 'callout',
    icon: '📢',
    title: 'Callout',
    value: calloutValue,
  },
  equation: {
    id: 'equation',
    icon: '🧮',
    title: 'Equation',
    value: equationValue,
  },
  upload: {
    id: 'upload',
    icon: '📤',
    title: 'Upload',
    value: uploadValue,
  },
  'slash-menu': {
    id: 'slash-menu',
    icon: '/',
    title: 'Slash Menu',
    value: slashMenuValue,
  },
  'block-menu': {
    id: 'block-menu',
    icon: '📋',
    title: 'Block Menu',
    value: blockMenuValue,
  },
  'floating-toolbar': {
    id: 'floating-toolbar',
    icon: '🧰',
    title: 'Floating Toolbar',
    value: floatingToolbarValue,
  },
  'media-toolbar': {
    id: 'media-toolbar',
    icon: '🎮',
    title: 'Media Toolbar',
    value: mediaToolbarValue,
  },
  'table-of-contents': {
    id: 'table-of-contents',
    icon: '📚',
    title: 'Table of Contents',
    value: tocValue,
  },
};

export const templateList = Object.values(templates);

export const getTemplateDocument = (documentId: string) => {
  return templates[documentId];
};

export const isTemplateDocument = (documentId: string) => {
  return !!templates[documentId];
};
