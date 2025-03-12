import { type Meta, type StoryObj } from '@storybook/react'

import { SignUpButton } from './signup-button'

const meta: Meta<typeof SignUpButton> = {
  title: 'Components/Button/SignUpButton',
  component: SignUpButton,
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
    bgColor: {
      control: 'text',
    },
    textColor: {
      control: 'text',
    },
    onSignUp: { action: 'signed up' },
    onFocus: { action: 'focused' },
    onBlur: { action: 'blurred' },
  },
  args: {
    label: 'Sign Up',
    showIcon: true,
    size: 'default',
    variant: 'default',
    disabled: false,
    fullWidth: false,
    isLoading: false,
    bgColor: 'bg-zinc-950',
    textColor: 'text-white',
  },
}

export default meta

type Story = StoryObj<typeof SignUpButton>

export const Default: Story = {}

export const WithCustomLabel: Story = {
  args: {
    label: 'Create Account',
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
    loadingText: 'Creating account...',
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

export const OutlineVariant: Story = {
  args: {
    variant: 'outline',
    bgColor: 'bg-transparent',
    textColor: 'text-zinc-950',
  },
}

export const GhostVariant: Story = {
  args: {
    variant: 'ghost',
    bgColor: 'bg-transparent',
    textColor: 'text-zinc-950',
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

export const CustomColors: Story = {
  args: {
    bgColor: 'bg-blue-600',
    textColor: 'text-white',
  },
}

export const WithCustomClassName: Story = {
  args: {
    className: 'shadow-xl hover:shadow-2xl transition-shadow',
  },
}

export const WithCallbacks: Story = {
  args: {
    onSignUp: () => console.log('Sign up button clicked'),
    onFocus: () => console.log('Sign up button focused'),
    onBlur: () => console.log('Sign up button blurred'),
  },
}
