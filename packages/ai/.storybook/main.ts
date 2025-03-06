import { dirname, join } from 'node:path'

import type { StorybookConfig } from '@storybook/nextjs'

const config: StorybookConfig = {
  stories: [
    '../components/**/*.mdx',
    '../components/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@storybook/addon-interactions'),
  ],
  framework: {
    name: getAbsolutePath('@storybook/nextjs'),
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  previewHead: (head) => `
  ${head}
  <link rel="stylesheet" href="https://rsms.me/inter/inter.css" />
  `,
}
export default config

function getAbsolutePath(value: string): string {
  return dirname(require.resolve(join(value, 'package.json')))
}
