import React from 'react'
import { cn } from '../../utils/cn'

export interface AskAILayoutProps {
  className?: string
  context: any | undefined
  sampleQuestions: string[]
  children: React.ReactNode
  title?: string
  showAskSolomon?: boolean
}

/**
 * Enhanced layout for the Analytic AI card.
 *
 * @param children - The child component to render within this component.
 * @param className - Additional CSS classes to apply to the component.
 * @param context - The context for the AI to operate in.
 * @param sampleQuestions - Array of sample questions to display.
 * @param title - Optional title for the layout.
 * @param showAskSolomon - Whether to show the AskSolomon component.
 */
const AskAILayout: React.FC<AskAILayoutProps> = ({
  children,
  className,
  context,
  sampleQuestions,
  title,
  showAskSolomon = true,
}) => {
  return (
    <div
      className={cn(
        'rounded-2xl border-4 border-gray-50 bg-white shadow-lg md:p-[1%]',
        className,
      )}
    >
      {title && (
        <h2 className="mb-4 px-4 pt-4 text-xl font-semibold">{title}</h2>
      )}
      <div className="flex items-center justify-between px-4 pb-4">
        {sampleQuestions.length > 0 && (
          <div className="flex-grow">
            <h3 className="mb-2 text-sm font-medium text-gray-500">
              Sample Questions:
            </h3>
            <ul className="text-sm text-gray-700">
              {sampleQuestions.slice(0, 3).map((question, index) => (
                <li key={index} className="mb-1">
                  {question}
                </li>
              ))}
            </ul>
          </div>
        )}
        {showAskSolomon && (
          <div className="flex-shrink-0">
            {/* <AskSolomon context={context} sampleQuestions={sampleQuestions} /> */}
          </div>
        )}
      </div>
      <div className="px-4 pb-4">{children}</div>
    </div>
  )
}

export default AskAILayout
