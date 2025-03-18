import { dirname, join } from "path"

import type { StorybookConfig } from '@storybook/react-vite';

/**
* This function is used to resolve the absolute path of a package.
* It is needed in projects that use Yarn PnP or are set up within a monorepo.
*/
function getAbsolutePath(value: string): any {
  return dirname(require.resolve(join(value, 'package.json')))
}
const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    getAbsolutePath('@storybook/addon-essentials'),
    getAbsolutePath('@storybook/addon-onboarding'),
    getAbsolutePath('@chromatic-com/storybook'),
    getAbsolutePath("@storybook/experimental-addon-test")
  ],
  "framework": {
    "name": getAbsolutePath('@storybook/react-vite'),
    "options": {}
  },
  "viteFinal": async (config) => {
    // Add process shim for browser environment
    if (!config.define) {
      config.define = {};
    }
    config.define = {
      ...config.define,
      process: { env: { NODE_ENV: JSON.stringify('development') } }
    };

    // Ensure React is properly provided
    if (!config.resolve) {
      config.resolve = {};
    }

    if (!config.resolve.alias) {
      config.resolve.alias = {};
    }

    // Add a polyfill or empty module for crypto
    config.resolve.alias.crypto = 'crypto-browserify';

    return config;
  }
};
export default config;