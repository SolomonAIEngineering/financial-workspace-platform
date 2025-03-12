import {
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Download,
  Heart,
  Loader2,
  Mail,
  Send,
} from 'lucide-react'
import type { Meta, StoryObj } from '@storybook/react'

import { Button } from './button'
import { CubeIcon } from '@radix-ui/react-icons'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link', 'success', 'warning', 'info'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'xl', 'icon'],
    },
    rounded: {
      control: 'select',
      options: ['default', 'full', 'md', 'lg', 'none'],
    },
    elevation: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
    },
    border: {
      control: 'select',
      options: ['none', 'thin', 'thick'],
    },
    isLoading: {
      control: 'boolean',
    },
    fullWidth: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
    onClick: { action: 'clicked' },
    onFocus: { action: 'focused' },
    onBlur: { action: 'blurred' },
    onMouseEnter: { action: 'mouse entered' },
    onMouseLeave: { action: 'mouse left' },
  },
}

export default meta

type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: {
    children: 'Primary Button',
    variant: 'default',
  },
}

export const Secondary: Story = {
  args: {
    children: 'Secondary Button',
    variant: 'secondary',
  },
}

export const Destructive: Story = {
  args: {
    children: 'Destructive Button',
    variant: 'destructive',
  },
}

export const Success: Story = {
  args: {
    children: 'Success Button',
    variant: 'success',
    startIcon: <CheckCircle className="h-4 w-4" />,
  },
}

export const Warning: Story = {
  args: {
    children: 'Warning Button',
    variant: 'warning',
    startIcon: <AlertCircle className="h-4 w-4" />,
  },
}

export const Info: Story = {
  args: {
    children: 'Info Button',
    variant: 'info',
    startIcon: <CubeIcon className="h-4 w-4" />,
  },
}

export const Outline: Story = {
  args: {
    children: 'Outline Button',
    variant: 'outline',
  },
}

export const Ghost: Story = {
  args: {
    children: 'Ghost Button',
    variant: 'ghost',
  },
}

export const Link: Story = {
  args: {
    children: 'Link Button',
    variant: 'link',
  },
}

export const WithStartIcon: Story = {
  args: {
    children: 'Email Button',
    startIcon: <Mail className="h-4 w-4" />,
  },
}

export const WithEndIcon: Story = {
  args: {
    children: 'Next Step',
    endIcon: <ChevronRight className="h-4 w-4" />,
  },
}

export const WithBothIcons: Story = {
  args: {
    children: 'Download',
    startIcon: <Download className="h-4 w-4" />,
    endIcon: <ChevronRight className="h-4 w-4" />,
  },
}

export const Loading: Story = {
  args: {
    children: 'Loading',
    isLoading: true,
  },
}

export const LoadingWithText: Story = {
  args: {
    children: 'Submit',
    isLoading: true,
    loadingText: 'Submitting...',
  },
}

export const Disabled: Story = {
  args: {
    children: 'Disabled Button',
    disabled: true,
  },
}

export const FullWidth: Story = {
  args: {
    children: 'Full Width Button',
    fullWidth: true,
  },
}

export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'lg',
  },
}

export const ExtraLarge: Story = {
  args: {
    children: 'Extra Large Button',
    size: 'xl',
  },
}

export const RoundedFull: Story = {
  args: {
    children: 'Rounded Full',
    rounded: 'full',
  },
}

export const RoundedMedium: Story = {
  args: {
    children: 'Rounded Medium',
    rounded: 'md',
  },
}

export const WithShadow: Story = {
  args: {
    children: 'With Shadow',
    elevation: 'md',
  },
}

export const WithLargeShadow: Story = {
  args: {
    children: 'Large Shadow',
    elevation: 'lg',
  },
}

export const WithThinBorder: Story = {
  args: {
    children: 'Thin Border',
    border: 'thin',
    variant: 'outline',
  },
}

export const WithThickBorder: Story = {
  args: {
    children: 'Thick Border',
    border: 'thick',
    variant: 'outline',
  },
}

export const IconOnly: Story = {
  args: {
    startIcon: <Heart className="h-4 w-4" />,
    size: 'icon',
    rounded: 'full',
    'aria-label': 'Like',
  },
}

export const WithCallbacks: Story = {
  args: {
    children: 'Interactive Button',
    onClick: () => console.log('Button clicked'),
    onFocus: () => console.log('Button focused'),
    onBlur: () => console.log('Button blurred'),
    onMouseEnter: () => console.log('Mouse entered'),
    onMouseLeave: () => console.log('Mouse left'),
  },
}

export const SendButton: Story = {
  args: {
    children: 'Send Message',
    startIcon: <Send className="h-4 w-4" />,
    variant: 'success',
    size: 'lg',
    rounded: 'md',
    elevation: 'sm',
  },
}
