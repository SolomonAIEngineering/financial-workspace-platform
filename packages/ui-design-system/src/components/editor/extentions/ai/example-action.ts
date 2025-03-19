'use server'

// In a browser environment like Storybook, we want to completely disable this function
// This is a simplified version that doesn't try to import server-only modules

type Params = {
  input: string
  context?: string
}

export async function generateEditorContent({ input, context }: Params) {
  // Check if we're running in a browser (like Storybook)
  if (typeof window !== 'undefined') {
    console.log(
      'AI features are disabled in browser environments like Storybook',
    )
    // Return a mock object that has a similar structure but doesn't use any server-only code
    return {
      output:
        'This is a mock AI response - AI features are disabled in Storybook',
    }
  }

  // The code below will only run in a server environment
  try {
    // Dynamically import the necessary modules only on the server
    const { createStreamableValue } = await import('ai/rsc')
    const { openai } = await import('@ai-sdk/openai')
    const { streamText } = await import('ai')

    const stream = createStreamableValue('')

    ;(async () => {
      const { textStream } = await streamText({
        model: openai('gpt-4o-mini'),
        prompt: input,
        temperature: 0.8,
        system: `
          You are an expert AI assistant specializing in content generation and improvement. Your task is to enhance or modify text based on specific instructions. Follow these guidelines:

          1. Language: Always respond in the same language as the input prompt.
          2. Conciseness: Keep responses brief and precise, with a maximum of 200 characters.

          Format your response as plain text, using '\n' for line breaks when necessary.
          Do not include any titles or headings in your response.
          Begin your response directly with the relevant text or information.
        ${context}
  `,
      })

      for await (const delta of textStream) {
        stream.update(delta)
      }

      stream.done()
    })()

    return { output: stream.value }
  } catch (error) {
    console.error('Error in AI generation:', error)
    return { output: 'Error generating AI content' }
  }
}
