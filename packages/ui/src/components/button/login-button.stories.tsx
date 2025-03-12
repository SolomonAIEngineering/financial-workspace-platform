import { type Meta, type StoryObj } from '@storybook/react'

import { LogInButton } from './login-button'

const meta: Meta<typeof LogInButton> = {
  title: 'Components/Button/LogInButton',
  component: LogInButton,
  argTypes: {
    className: {
      control: 'text',
    },
    label: {
      control: 'text',
    },
    isLoading: {
      control: 'boolean',
    },
    loadingText: {
      control: 'text',
    },
    showIcon: {
      control: 'boolean',
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'xl'],
    },
    variant: {
      control: 'select',
      options: ['default', 'outline', 'ghost', 'secondary'],
    },
    disabled: {
      control: 'boolean',
    },
    fullWidth: {
      control: 'boolean',
    },
    onLogin: { action: 'logged in' },
    onFocus: { action: 'focused' },
    onBlur: { action: 'blurred' },
  },
  args: {
    label: 'Log In',
    showIcon: true,
    size: 'default',
    variant: 'outline',
    disabled: false,
    fullWidth: false,
    isLoading: false,
  },
}

export default meta

type Story = StoryObj<typeof LogInButton>

export const Default: Story = {}

export const WithCustomLabel: Story = {
  args: {
    label: 'Sign In',
  },
}

export const Loading: Story = {
  args: {
    isLoading: true,
  },
}

export const LoadingWithCustomText: Story = {
  args: {
    isLoading: true,
    loadingText: 'Authenticating...',
  },
}

export const WithoutIcon: Story = {
  args: {
    showIcon: false,
  },
}

export const Small: Story = {
  args: {
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    size: 'lg',
  },
}

export const ExtraLarge: Story = {
  args: {
    size: 'xl',
  },
}

export const DefaultVariant: Story = {
  args: {
    variant: 'default',
  },
}

export const GhostVariant: Story = {
  args: {
    variant: 'ghost',
  },
}

export const SecondaryVariant: Story = {
  args: {
    variant: 'secondary',
  },
}

export const Disabled: Story = {
  args: {
    disabled: true,
  },
}

export const FullWidth: Story = {
  args: {
    fullWidth: true,
  },
}

export const WithCustomClassName: Story = {
  args: {
    className: 'bg-blue-500 hover:bg-blue-700 text-white',
  },
}

export const WithCallbacks: Story = {
  args: {
    onLogin: () => console.log('Login button clicked'),
    onFocus: () => console.log('Login button focused'),
    onBlur: () => console.log('Login button blurred'),
  },
}
