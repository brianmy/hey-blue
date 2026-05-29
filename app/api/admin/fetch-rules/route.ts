import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export async function POST(req: NextRequest) {
  if (req.headers.get('x-admin-password') !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { url } = await req.json()
  if (!url?.trim()) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  // Fetch the page content
  let pageText: string
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    const html = await res.text()
    // Strip HTML tags to get plain text
    pageText = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    if (pageText.length > 40000) pageText = pageText.slice(0, 40000)
  } catch {
    return NextResponse.json({ error: 'Could not fetch that URL. Check it is publicly accessible.' }, { status: 422 })
  }

  // Use Claude to extract the rules as clean structured text
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: `The following is text from a youth baseball league rules page. Extract all of the playing rules, participation rules, pitching rules, and equipment rules as clean, structured plain text. Preserve the rule numbers and categories. Remove any navigation, ads, contact info, or non-rule content. Format as a readable document an umpire can reference.

PAGE TEXT:
${pageText}`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type !== 'text') {
    return NextResponse.json({ error: 'Failed to extract rules' }, { status: 500 })
  }

  return NextResponse.json({ rules: content.text })
}
