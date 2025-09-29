import { generateText } from "ai"

export async function POST(request: Request) {
  try {
    const { transcript, clientContext } = await request.json()

    if (!transcript || transcript.length === 0) {
      return Response.json({ error: "No transcript provided" }, { status: 400 })
    }

    // Combine all transcript segments into a single text
    const fullTranscript = transcript
      .map((segment: any) => `[${new Date(segment.timestamp).toLocaleTimeString()}] ${segment.text}`)
      .join("\n")

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `You are an AI assistant specialized in analyzing financial advisor client conversations. 
      
Please analyze the following conversation transcript and provide a comprehensive summary tailored for wealth management professionals.

Client Context: ${clientContext || "General client meeting"}

Conversation Transcript:
${fullTranscript}

Please provide your analysis in the following JSON format:
{
  "summary": "A concise 2-3 sentence summary of the key discussion points",
  "keyTopics": ["Array of 4-6 main topics discussed"],
  "clientSentiment": "positive/neutral/concerned",
  "riskTolerance": "conservative/moderate/aggressive/unclear",
  "investmentGoals": ["Array of identified investment objectives"],
  "concerns": ["Array of client concerns or pain points"],
  "opportunities": ["Array of identified business opportunities"],
  "nextSteps": [
    {
      "task": "Specific actionable task",
      "priority": "High/Medium/Low",
      "assignee": "Role responsible (e.g., Financial Advisor, Portfolio Manager, Tax Specialist)",
      "dueDate": "YYYY-MM-DD (suggest realistic timeline)",
      "category": "portfolio/planning/compliance/research/client_service"
    }
  ],
  "followUpRecommendations": "Suggested timeline and approach for next client interaction",
  "complianceNotes": "Any regulatory or compliance considerations mentioned"
}

Focus on:
- Investment performance discussions
- Risk tolerance changes
- Life events affecting financial planning
- Tax optimization opportunities
- Estate planning needs
- Retirement planning adjustments
- Insurance coverage gaps
- Regulatory compliance requirements

Ensure all recommendations are specific, actionable, and appropriate for a professional wealth management practice.`,
    })

    // Parse the AI response
    let analysisResult
    try {
      analysisResult = JSON.parse(text)
    } catch (parseError) {
      // If JSON parsing fails, create a structured response
      analysisResult = {
        summary: "Analysis completed - please review transcript for detailed insights.",
        keyTopics: ["Conversation Analysis"],
        clientSentiment: "neutral",
        riskTolerance: "unclear",
        investmentGoals: ["Review Required"],
        concerns: [],
        opportunities: [],
        nextSteps: [
          {
            task: "Review conversation transcript and create detailed analysis",
            priority: "Medium",
            assignee: "Financial Advisor",
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            category: "client_service",
          },
        ],
        followUpRecommendations: "Schedule follow-up within 1-2 weeks",
        complianceNotes: "Standard documentation requirements apply",
      }
    }

    return Response.json({
      success: true,
      analysis: analysisResult,
      processedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Summarization error:", error)
    return Response.json({ error: "Failed to process conversation" }, { status: 500 })
  }
}
