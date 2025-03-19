import type { Meta, StoryObj } from '@storybook/react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from './collapsible'

import { CaretSortIcon } from '@radix-ui/react-icons'
import { useState } from 'react'
import { Button } from './button'

const meta: Meta<typeof Collapsible> = {
  component: Collapsible,
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof Collapsible>

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false)

    return (
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-[350px] space-y-2"
      >
        <div className="flex items-center justify-between space-x-4 px-4">
          <h4 className="text-sm font-semibold">
            What is a Collapsible component?
          </h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              <CaretSortIcon className="h-4 w-4" />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="space-y-2">
          <div className="rounded-md border px-4 py-3 text-sm">
            A Collapsible component allows users to toggle the visibility of
            content, providing a way to hide information when it's not needed
            and reveal it when it is. It's often used for FAQs, navigation
            menus, or any section that needs to be expandable and collapsible.
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  },
}

export const MultipleCollapsible: Story = {
  render: () => {
    const faqs = [
      {
        question: 'What is a Collapsible component?',
        answer:
          "A Collapsible component allows users to toggle the visibility of content, providing a way to hide information when it's not needed and reveal it when it is.",
      },
      {
        question: 'When should I use a Collapsible?',
        answer:
          "Use a Collapsible when you need to save space or reduce visual clutter by hiding secondary content. It's great for FAQs, nested navigation, or complex forms.",
      },
      {
        question: 'Is a Collapsible the same as an Accordion?',
        answer:
          'While they share similarities, an Accordion is typically a set of Collapsible items where only one can be open at a time, enforcing mutual exclusivity.',
      },
    ]

    return (
      <div className="w-[400px] space-y-4">
        {faqs.map((faq, index) => (
          <Collapsible key={index} className="rounded-lg border">
            <div className="flex items-center justify-between px-4 py-2">
              <h4 className="text-sm font-medium">{faq.question}</h4>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  <CaretSortIcon className="h-4 w-4" />
                  <span className="sr-only">Toggle</span>
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
              <div className="text-muted-foreground border-t px-4 py-2 text-sm">
                {faq.answer}
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    )
  },
}

export const WithAnimation: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false)

    return (
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="w-[350px] space-y-2"
      >
        <div className="flex items-center justify-between space-x-4 rounded-t-lg border px-4 py-2">
          <h4 className="text-sm font-semibold">Animated Collapsible</h4>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="transition-transform duration-200"
            >
              <CaretSortIcon
                className={`h-4 w-4 ${isOpen ? 'rotate-180' : ''}`}
              />
              <span className="sr-only">Toggle</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp overflow-hidden">
          <div className="rounded-b-md border px-4 py-3 text-sm">
            This content slides down when expanded and slides up when collapsed,
            providing a smooth transition between states.
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  },
}
