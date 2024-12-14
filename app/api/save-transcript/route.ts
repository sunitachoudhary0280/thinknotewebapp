import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { transcript } = await request.json()

    if (!transcript) {
      return NextResponse.json({ error: 'No transcript provided' }, { status: 400 })
    }

    // Here you would typically save the transcript to a database
    // For this example, we'll just return it as a downloadable file

    const fileName = `transcript_${new Date().toISOString().replace(/[:.]/g, '-')}.txt`

    return new NextResponse(transcript, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    })
  } catch (error) {
    console.error('Error saving transcript:', error)
    return NextResponse.json({ error: 'Failed to save transcript' }, { status: 500 })
  }
}