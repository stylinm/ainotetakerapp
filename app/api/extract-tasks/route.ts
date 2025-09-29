import { generateText } from "ai"

export async function POST(request: Request) {
  try {
    const { transcript, existingTasks = [] } = await request.json()

    if (!transcript || transcript.length === 0) {
      return Response.json({ error: "No transcript provided" }, { status: 400 })
    }

    const fullTranscript = transcript
      .map((segment: any) => `[${new Date(segment.timestamp).toLocaleTimeString()}] ${segment.text}`)
      .join("\n")

    const { text } = await generateText({
      model: "openai/gpt-4o-mini",
      prompt: `You are an AI assistant specialized in extracting actionable tasks from financial advisor client conversations.

Analyze the following conversation transcript and extract specific, actionable tasks that need to be completed by the financial advisory team.

Conversation Transcript:
${fullTranscript}

Existing Tasks Context:
${existingTasks.length > 0 ? JSON.stringify(existingTasks, null, 2) : "No existing tasks"}

Please extract tasks in the following JSON format:
{
  "tasks": [
    {
      "task": "Specific, actionable task description",
      "priority": "High/Medium/Low",
      "assignee": "Specific role (Financial Advisor, Portfolio Manager, Tax Specialist, Compliance Officer, Client Services, Research Analyst)",
      "dueDate": "YYYY-MM-DD",
      "category": "portfolio/planning/compliance/research/client_service/tax/insurance/estate",
      "clientImpact": "How this task benefits the client",
      "estimatedHours": "1-8 hours",
      "dependencies": ["Any prerequisite tasks or information needed"]
    }
  ]
}

Task Extraction Guidelines:
1. Focus on concrete actions mentioned or implied in the conversation
2. Prioritize based on client impact and urgency
3. Assign to appropriate team members based on expertise
4. Set realistic due dates (1-30 days depending on complexity)
5. Include research tasks, follow-up calls, document preparation, analysis work
6. Consider compliance and regulatory requirements
7. Don't duplicate existing tasks unless there's new information

Common Financial Advisory Tasks to Look For:
- Portfolio rebalancing or adjustments
- Research specific investments or strategies
- Prepare financial projections or analyses
- Schedule follow-up meetings
- Update client documentation
- Tax planning activities
- Insurance reviews
- Estate planning updates
- Compliance documentation
- Market research and recommendations

Only extract tasks that are clearly actionable and relevant to the conversation.`,
    })

    let extractedTasks
    try {
      extractedTasks = JSON.parse(text)
    } catch (parseError) {
      extractedTasks = {
        tasks: [
          {
            task: "Review conversation and identify action items",
            priority: "Medium",
            assignee: "Financial Advisor",
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            category: "client_service",
            clientImpact: "Ensures all client needs are addressed",
            estimatedHours: "1-2 hours",
            dependencies: ["Conversation transcript review"],
          },
        ],
      }
    }

    return Response.json({
      success: true,
      extractedTasks: extractedTasks.tasks || [],
      processedAt: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Task extraction error:", error)
    return Response.json({ error: "Failed to extract tasks" }, { status: 500 })
  }
}
