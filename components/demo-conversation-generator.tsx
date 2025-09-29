"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Loader2, Zap } from "lucide-react"

interface TranscriptSegment {
  id: string
  text: string
  timestamp: number
  speaker?: string
}

interface DemoConversationGeneratorProps {
  onGenerateTranscript: (transcript: TranscriptSegment[], scenarioData: any) => void
}

const demoScenarios = {
  "portfolio-review": {
    title: "Quarterly Portfolio Review",
    description: "Client discussing portfolio performance and investment goals",
    clientName: "Sarah Johnson",
    meetingType: "Quarterly Portfolio Review",
    keyTopics: [
      "Portfolio Performance Review",
      "ESG Investment Options",
      "Tax-Loss Harvesting",
      "401k Contribution Increase",
    ],
    summary:
      "Client expressed satisfaction with current portfolio performance (+12.3% YTD). Discussed increasing contribution to 401(k) to maximize employer match. Identified opportunity for tax-loss harvesting in taxable account. Client interested in ESG investment options for new contributions.",
    nextSteps: [
      {
        id: 1,
        task: "Research ESG fund options for client portfolio",
        priority: "High",
        dueDate: "2024-01-20",
        assignee: "Portfolio Manager",
        status: "pending",
      },
      {
        id: 2,
        task: "Prepare tax-loss harvesting analysis",
        priority: "Medium",
        dueDate: "2024-01-25",
        assignee: "Tax Specialist",
        status: "pending",
      },
      {
        id: 3,
        task: "Update 401k contribution recommendations",
        priority: "High",
        dueDate: "2024-01-18",
        assignee: "Financial Advisor",
        status: "pending",
      },
    ],
    transcript: [
      {
        text: "Good morning Sarah, thank you for coming in today. I wanted to review your portfolio performance for the quarter and discuss some opportunities I've identified.",
        speaker: "Advisor",
      },
      {
        text: "Thank you for meeting with me. I've been pleased with the returns so far, but I'm curious about the ESG investments we discussed last time.",
        speaker: "Client",
      },
      {
        text: "Absolutely. Your portfolio is up 12.3% year-to-date, which is outperforming the S&P 500 by about 2%. Regarding ESG, I've researched several sustainable funds that align with your values and could replace about 20% of your current equity allocation.",
        speaker: "Advisor",
      },
      {
        text: "That sounds interesting. I'm also wondering about tax implications. My accountant mentioned something about tax-loss harvesting opportunities in my taxable account.",
        speaker: "Client",
      },
      {
        text: "Great point. I've identified about $15,000 in unrealized losses that we could harvest before year-end. This would offset some of your capital gains and reduce your tax liability. I can prepare a detailed analysis for you.",
        speaker: "Advisor",
      },
      {
        text: "Perfect. Also, my company just increased the 401k match to 6%. Should I increase my contribution?",
        speaker: "Client",
      },
      {
        text: "Absolutely. That's free money you don't want to leave on the table. I recommend increasing your contribution to at least 6% to get the full match. We can adjust your other investments accordingly.",
        speaker: "Advisor",
      },
    ],
  },
  "retirement-planning": {
    title: "Retirement Planning Discussion",
    description: "Client concerned about retirement readiness and healthcare costs",
    clientName: "Michael Chen",
    meetingType: "Retirement Planning Consultation",
    keyTopics: [
      "Retirement Timeline",
      "Healthcare Cost Planning",
      "Long-term Care Insurance",
      "Social Security Strategy",
    ],
    summary:
      "Client planning to retire at 62 with current savings of $850,000. Discussed healthcare cost concerns and long-term care insurance options. Recommended delaying Social Security until full retirement age for 30% benefit increase. Client interested in hybrid life insurance policies with LTC riders.",
    nextSteps: [
      {
        id: 1,
        task: "Prepare comprehensive retirement income projection",
        priority: "High",
        dueDate: "2024-01-22",
        assignee: "Financial Planner",
        status: "pending",
      },
      {
        id: 2,
        task: "Research long-term care insurance options",
        priority: "Medium",
        dueDate: "2024-01-28",
        assignee: "Insurance Specialist",
        status: "pending",
      },
      {
        id: 3,
        task: "Create Social Security optimization analysis",
        priority: "Medium",
        dueDate: "2024-02-01",
        assignee: "Retirement Specialist",
        status: "pending",
      },
    ],
    transcript: [
      {
        text: "Hi Michael, I know you wanted to discuss your retirement timeline. You mentioned you're hoping to retire at 62?",
        speaker: "Advisor",
      },
      {
        text: "Yes, that's the goal. But I'm honestly worried I won't have enough saved. Healthcare costs keep rising, and I'm not sure my current savings rate is sufficient.",
        speaker: "Client",
      },
      {
        text: "Let's run through the numbers. Based on your current savings of $850,000 and your monthly contributions of $3,500, you're actually in better shape than you think. However, healthcare is a valid concern.",
        speaker: "Advisor",
      },
      {
        text: "What about long-term care insurance? My father had to go into assisted living and it was incredibly expensive.",
        speaker: "Client",
      },
      {
        text: "That's a smart consideration. Long-term care insurance can protect your retirement assets. I'd recommend we look at hybrid life insurance policies with long-term care riders. They provide flexibility and guaranteed benefits.",
        speaker: "Advisor",
      },
      {
        text: "I'm also thinking about Social Security. Should I take it early or wait until full retirement age?",
        speaker: "Client",
      },
      {
        text: "For your situation, waiting until full retirement age at 67 would increase your monthly benefit by about 30%. Given your health and family longevity, that's likely the better strategy. Let me prepare a comprehensive retirement income projection for you.",
        speaker: "Advisor",
      },
    ],
  },
  "estate-planning": {
    title: "Estate Planning Consultation",
    description: "High-net-worth client discussing wealth transfer and tax strategies",
    clientName: "Jennifer Martinez",
    meetingType: "Estate Planning Review",
    keyTopics: ["Estate Tax Planning", "Business Succession", "Trust Structures", "Wealth Transfer Strategies"],
    summary:
      "High-net-worth client ($4.2M) needs comprehensive estate planning. Discussed revocable living trust, ILIT for tax efficiency, and business succession planning. Recommended GRAT or installment sale for business interests. Client interested in incentive-based distributions and family financial education.",
    nextSteps: [
      {
        id: 1,
        task: "Draft revocable living trust documents",
        priority: "High",
        dueDate: "2024-01-25",
        assignee: "Estate Attorney",
        status: "pending",
      },
      {
        id: 2,
        task: "Prepare business valuation for succession planning",
        priority: "High",
        dueDate: "2024-02-01",
        assignee: "Business Valuator",
        status: "pending",
      },
      {
        id: 3,
        task: "Design family financial education program",
        priority: "Medium",
        dueDate: "2024-02-15",
        assignee: "Family Office Coordinator",
        status: "pending",
      },
    ],
    transcript: [
      {
        text: "Jennifer, thank you for bringing your estate planning documents. I've reviewed them with our estate planning attorney, and we have several recommendations.",
        speaker: "Advisor",
      },
      {
        text: "I'm glad we're finally addressing this. With the business doing well and the kids getting older, I know I need to get my affairs in order.",
        speaker: "Client",
      },
      {
        text: "Your current net worth of $4.2 million puts you above the federal estate tax exemption threshold. We should consider establishing a revocable living trust to avoid probate and potentially an irrevocable life insurance trust for tax efficiency.",
        speaker: "Advisor",
      },
      {
        text: "What about the business? I want to make sure it can continue operating if something happens to me, but I also want to minimize the tax burden on my children.",
        speaker: "Client",
      },
      {
        text: "For the business, I recommend a buy-sell agreement funded with life insurance. We should also explore a grantor retained annuity trust or installment sale to transfer business interests at a discount. This could save hundreds of thousands in estate taxes.",
        speaker: "Advisor",
      },
      {
        text: "That sounds complex. How do we ensure my children are prepared to handle this wealth responsibly?",
        speaker: "Client",
      },
      {
        text: "Excellent question. We can structure distributions through the trust with incentive provisions - education milestones, career achievements, or charitable giving requirements. I also recommend family financial education sessions to prepare them.",
        speaker: "Advisor",
      },
    ],
  },
}

export function DemoConversationGenerator({ onGenerateTranscript }: DemoConversationGeneratorProps) {
  const [selectedScenario, setSelectedScenario] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)

  const generateDemoTranscript = async () => {
    console.log("[v0] Demo button clicked, selectedScenario:", selectedScenario)

    if (!selectedScenario) {
      console.log("[v0] No scenario selected, returning early")
      return
    }

    console.log("[v0] Starting demo generation...")
    setIsGenerating(true)

    // Simulate realistic conversation timing
    const scenario = demoScenarios[selectedScenario as keyof typeof demoScenarios]
    console.log("[v0] Selected scenario:", scenario.title)

    const transcript: TranscriptSegment[] = []

    let currentTime = Date.now()

    for (const segment of scenario.transcript) {
      // Add realistic delays between speakers
      currentTime += Math.random() * 5000 + 3000 // 3-8 seconds between segments

      transcript.push({
        id: `demo-${currentTime}`,
        text: segment.text,
        timestamp: currentTime,
        speaker: segment.speaker,
      })
    }

    console.log("[v0] Generated transcript with", transcript.length, "segments")

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000))

    console.log("[v0] Calling onGenerateTranscript with transcript and scenario data")
    onGenerateTranscript(transcript, scenario)
    setIsGenerating(false)
    console.log("[v0] Demo generation complete")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Demo Conversation Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Demo Scenario</label>
          <Select value={selectedScenario} onValueChange={setSelectedScenario}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a conversation scenario..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(demoScenarios).map(([key, scenario]) => (
                <SelectItem key={key} value={key}>
                  {scenario.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedScenario && (
          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm font-medium mb-1">
              {demoScenarios[selectedScenario as keyof typeof demoScenarios].title}
            </p>
            <p className="text-xs text-muted-foreground">
              {demoScenarios[selectedScenario as keyof typeof demoScenarios].description}
            </p>
          </div>
        )}

        <Button onClick={generateDemoTranscript} disabled={!selectedScenario || isGenerating} className="w-full">
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating Demo Conversation...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Generate Demo Conversation
            </>
          )}
        </Button>

        <div className="text-xs text-muted-foreground">
          <p>
            <strong>Demo Features:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>Realistic financial advisor-client conversations</li>
            <li>AI-powered conversation analysis and summarization</li>
            <li>Automatic task extraction with priorities and assignments</li>
            <li>Client sentiment analysis and risk assessment</li>
            <li>Actionable next steps and follow-up recommendations</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
