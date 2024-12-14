import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'

// Initialize the Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

export async function POST(request: Request) {
  try {
    // Parse the incoming request body
    const { transcript1, transcript2 } = await request.json()

    // Validate the input
    if (!transcript1 || !transcript2 || typeof transcript1 !== 'string' || typeof transcript2 !== 'string') {
      return NextResponse.json({ error: 'Invalid transcripts provided' }, { status: 400 })
    }

    // Combine the transcripts
    const combinedTranscript = `${transcript1} ${transcript2}`

    // Process the combined transcript with Groq
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are an AI assistant specialized in analyzing transcripts. Provide concise and insightful summaries."
        },
        {
          role: "user",
          content: `I want that my project should work like I want the functionality that the text from the second text box gets combined with the text from the first text box and the data is sent to the LLM model like Groq model and the output gets displayed in the third text box as the user has specified.`
        },
        {
          role: "assistant",
          content: `You want to create a UI component that allows users to combine text from two text boxes and send it to the Groq model.`
        },
        {
          role: "user",
          content: combinedTranscript
        }
      ],
      model: "llama3-8b-8192",
      temperature: 1,
      max_tokens: 1024,
      top_p: 1,
    })

    // Extract the summary from the Groq response
    const summary = completion.choices[0]?.message?.content || "Unable to generate summary."

    // Return the processed result
    return NextResponse.json({ 
      response: summary,
      status: 'success'
    })

  }
  
};

