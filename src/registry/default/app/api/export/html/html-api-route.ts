import { NextResponse } from 'next/server';
import { promises as fs } from 'node:fs';

export async function GET() {
  try {
    // Refer to the Tailwind cli documentation and generate the tailwind.css file based on the configuration of your app.
    const tailwindCss = await fs.readFile(
      `${process.cwd()}/public/css/tailwind.css`,
      'utf8'
    );
    // Same with your src/registry/default/potion-ui/code-block-element.css
    const prismCss = await fs.readFile(
      `${process.cwd()}/public/css/prism.css`,
      'utf8'
    );

    const mergedCss = `${tailwindCss}\n${prismCss}`;

    return new NextResponse(mergedCss, {
      headers: {
        'Content-Type': 'text/css',
      },
    });
  } catch (error) {
    console.error('Failed to read CSS file:', error);

    return NextResponse.json(
      { message: 'Failed to read CSS file' },
      { status: 500 }
    );
  }
}
