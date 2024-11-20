import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'

// Initialize the Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

export async function POST(request: Request) {
  try {
    // Parse the incoming request body
    const { transcript } = await request.json()

    // Validate the input
    if (!transcript || typeof transcript !== 'string') {
      return NextResponse.json({ error: 'Invalid transcript provided' }, { status: 400 })
    }

    // Process the transcript with Groq
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an AI assistant specialized in analyzing transcripts. Provide concise and insightful ."
        },
        {
          role: "user",
          content: `Please highlight key points and give answer benetif if user want'

${transcript}`
        }
      ],
      model: "mixtral-8x7b-32768",
      temperature: 0.5,
      max_tokens: 1024,
    })

    // Extract the summary from the Groq response
    const summary = completion.choices[0]?.message?.content || "Unable to generate summary."

    // Return the processed result
    return NextResponse.json({ 
      response: summary,
      status: 'success'
    })

  } catch (error) {
    console.error('Error processing transcript:', error)
    
    // Determine if it's a Groq API error
    if (error instanceof Groq.APIError) {
      return NextResponse.json({ 
        error: 'Groq API error', 
        details: error.message 
      }, { status: 500 })
    }
    
    // Generic error response
    return NextResponse.json({ 
      error: 'Failed to process transcript',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}