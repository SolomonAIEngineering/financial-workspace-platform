import { type Meta, type StoryObj } from '@storybook/react'

import SimpleNotificationBanner from './simple-notification-banner'

const meta: Meta<typeof SimpleNotificationBanner> = {
  title: 'Components/Banner/SimpleNotificationBanner',
  component: SimpleNotificationBanner,
  parameters: {
    layout: 'fullscreen',
  },
  argTypes: {
    position: {
      control: {
        type: 'select',
        options: ['top', 'bottom', 'top-left', 'top-right', 'bottom-left', 'bottom-right'],
      },
      defaultValue: 'bottom',
    },
    centered: {
      control: 'boolean',
      defaultValue: false,
    },
    fullScreen: {
      control: 'boolean',
      defaultValue: false,
    },
    marginLeft: {
      control: 'boolean',
      defaultValue: false,
    },
    message: {
      control: 'text',
    },
    title: {
      control: 'text',
    },
    primaryLabel: {
      control: 'text',
    },
    secondaryLabel: {
      control: 'text',
    },
    showCloseButton: {
      control: 'boolean',
    },
    dismissible: {
      control: 'boolean',
    },
    variant: {
      control: {
        type: 'select',
        options: ['default', 'success', 'warning', 'error', 'info'],
      },
    },
    autoDismiss: {
      control: 'boolean',
    },
    autoDismissTimeout: {
      control: 'number',
    },
    animate: {
      control: 'boolean',
    },
    zIndex: {
      control: 'number',
    },
    showIcon: {
      control: 'boolean',
    },
    singleButton: {
      control: 'boolean',
    },
    width: {
      control: 'text',
    },
    showProgressBar: {
      control: 'boolean',
    },
  },
  args: {
    message: 'This is a simple notification banner message.',
    title: 'Notification Title',
    primaryLabel: 'Accept',
    secondaryLabel: 'Reject',
    showCloseButton: true,
    dismissible: true,
    variant: 'default',
    autoDismiss: false,
    autoDismissTimeout: 5000,
    animate: true,
    zIndex: 50,
    showIcon: true,
    singleButton: false,
    width: 'auto',
    showProgressBar: false,
  },
}

export default meta

type Story = StoryObj<typeof SimpleNotificationBanner>

export const Default: Story = {}

export const WithTitle: Story = {
  args: {
    title: 'Important Notification',
    message: 'This notification includes a title for better visibility.',
  },
}

export const CustomButtonLabels: Story = {
  args: {
    primaryLabel: 'Confirm',
    secondaryLabel: 'Cancel',
    message: 'This notification has custom button labels.',
  },
}

export const WithCallbacks: Story = {
  args: {
    message: 'This notification has callback functions for its buttons.',
    onPrimaryAction: () => alert('Primary button clicked!'),
    onSecondaryAction: () => alert('Secondary button clicked!'),
    onClose: () => alert('Close button clicked!'),
  },
}

export const SingleButton: Story = {
  args: {
    singleButton: true,
    primaryLabel: 'Acknowledge',
    message: 'This notification has only one button.',
  },
}

export const NoCloseButton: Story = {
  args: {
    showCloseButton: false,
    message: 'This notification does not have a close button.',
  },
}

export const NonDismissible: Story = {
  args: {
    dismissible: false,
    message: 'This notification is not dismissible when clicking buttons.',
  },
}

export const AutoDismiss: Story = {
  args: {
    autoDismiss: true,
    autoDismissTimeout: 3000,
    message: 'This notification will auto-dismiss after 3 seconds.',
  },
}

export const WithProgressBar: Story = {
  args: {
    autoDismiss: true,
    autoDismissTimeout: 5000,
    showProgressBar: true,
    message: 'This notification shows a progress bar for auto-dismiss.',
  },
}

export const SuccessVariant: Story = {
  args: {
    variant: 'success',
    title: 'Success',
    message: 'Your changes have been saved successfully!',
  },
}

export const WarningVariant: Story = {
  args: {
    variant: 'warning',
    title: 'Warning',
    message: 'Please review your changes before proceeding.',
  },
}

export const ErrorVariant: Story = {
  args: {
    variant: 'error',
    title: 'Error',
    message: 'An error occurred while processing your request.',
  },
}

export const InfoVariant: Story = {
  args: {
    variant: 'info',
    title: 'Information',
    message: 'Here is some important information you should know.',
  },
}

export const NoIcon: Story = {
  args: {
    showIcon: false,
    message: 'This notification does not display an icon.',
  },
}

export const TopPosition: Story = {
  args: {
    position: 'top',
    message: 'This notification appears at the top of the screen.',
  },
}

export const BottomPosition: Story = {
  args: {
    position: 'bottom',
    message: 'This notification appears at the bottom of the screen.',
  },
}

export const TopLeftPosition: Story = {
  args: {
    position: 'top-left',
    message: 'This notification appears at the top-left of the screen.',
  },
}

export const TopRightPosition: Story = {
  args: {
    position: 'top-right',
    message: 'This notification appears at the top-right of the screen.',
  },
}

export const BottomLeftPosition: Story = {
  args: {
    position: 'bottom-left',
    message: 'This notification appears at the bottom-left of the screen.',
  },
}

export const BottomRightPosition: Story = {
  args: {
    position: 'bottom-right',
    message: 'This notification appears at the bottom-right of the screen.',
  },
}

export const Centered: Story = {
  args: {
    centered: true,
    message: 'This notification is centered horizontally.',
  },
}

export const FullScreen: Story = {
  args: {
    fullScreen: true,
    message: 'This notification spans the full width of the screen.',
  },
}

export const CustomWidth: Story = {
  args: {
    width: '300px',
    message: 'This notification has a custom width of 300px.',
  },
}

export const FullWidth: Story = {
  args: {
    width: 'full',
    message: 'This notification has full width.',
  },
}

export const WithRichContent: Story = {
  args: {
    title: 'Rich Content',
    message: (
      <div>
        <p>This notification contains <strong>rich content</strong> with formatting.</p>
        <ul className="list-disc pl-5 mt-2">
          <li>Item 1</li>
          <li>Item 2</li>
          <li>Item 3</li>
        </ul>
      </div>
    ),
  },
}

export const WithCustomStyles: Story = {
  args: {
    className: 'max-w-md',
    cardClassName: 'border-dashed border-2',
    message: 'This notification has custom styling applied.',
  },
}

export const NoAnimation: Story = {
  args: {
    animate: false,
    message: 'This notification appears without animation.',
  },
}

export const HighZIndex: Story = {
  args: {
    zIndex: 100,
    message: 'This notification has a higher z-index (100).',
  },
}
