"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Brain, Loader2, TrendingUp, AlertTriangle, Target, CheckCircle2, Clock } from "lucide-react"

interface TranscriptSegment {
  id: string
  text: string
  timestamp: number
  speaker?: string
}

interface AnalysisResult {
  summary: string
  keyTopics: string[]
  clientSentiment: string
  riskTolerance: string
  investmentGoals: string[]
  concerns: string[]
  opportunities: string[]
  nextSteps: Array<{
    task: string
    priority: string
    assignee: string
    dueDate: string
    category: string
  }>
  followUpRecommendations: string
  complianceNotes: string
}

interface AIAnalysisPanelProps {
  transcript: TranscriptSegment[]
}

export function AIAnalysisPanel({ transcript }: AIAnalysisPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [clientContext, setClientContext] = useState("")

  const handleAnalyze = async () => {
    if (transcript.length === 0) return

    setIsAnalyzing(true)
    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transcript,
          clientContext,
        }),
      })

      const result = await response.json()
      if (result.success) {
        setAnalysis(result.analysis)
      }
    } catch (error) {
      console.error("Analysis failed:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment.toLowerCase()) {
      case "positive":
        return "bg-success text-success-foreground"
      case "concerned":
        return "bg-warning text-warning-foreground"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  const getRiskToleranceColor = (risk: string) => {
    switch (risk.toLowerCase()) {
      case "aggressive":
        return "bg-destructive text-destructive-foreground"
      case "moderate":
        return "bg-warning text-warning-foreground"
      case "conservative":
        return "bg-success text-success-foreground"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      {/* Analysis Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Conversation Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="client-context">Client Context (Optional)</Label>
            <Textarea
              id="client-context"
              placeholder="Add any relevant client background, previous meeting notes, or specific focus areas..."
              value={clientContext}
              onChange={(e) => setClientContext(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <Button onClick={handleAnalyze} disabled={transcript.length === 0 || isAnalyzing} className="w-full">
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing Conversation...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4 mr-2" />
                Analyze Conversation
              </>
            )}
          </Button>

          {transcript.length === 0 && (
            <p className="text-sm text-muted-foreground text-center">Record a conversation to enable AI analysis</p>
          )}
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysis && (
        <div className="space-y-6">
          {/* Summary & Key Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Conversation Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-relaxed">{analysis.summary}</p>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Client Sentiment</Label>
                  <Badge className={getSentimentColor(analysis.clientSentiment)}>{analysis.clientSentiment}</Badge>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Risk Tolerance</Label>
                  <Badge className={getRiskToleranceColor(analysis.riskTolerance)}>{analysis.riskTolerance}</Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium mb-2 block">Key Topics Discussed</Label>
                  <div className="flex flex-wrap gap-2">
                    {analysis.keyTopics.map((topic, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>

                {analysis.investmentGoals.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block flex items-center gap-1">
                      <Target className="h-4 w-4" />
                      Investment Goals
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {analysis.investmentGoals.map((goal, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {goal}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.concerns.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block flex items-center gap-1">
                      <AlertTriangle className="h-4 w-4" />
                      Client Concerns
                    </Label>
                    <div className="space-y-1">
                      {analysis.concerns.map((concern, index) => (
                        <p key={index} className="text-xs text-muted-foreground">
                          • {concern}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {analysis.opportunities.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium mb-2 block flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      Business Opportunities
                    </Label>
                    <div className="space-y-1">
                      {analysis.opportunities.map((opportunity, index) => (
                        <p key={index} className="text-xs text-muted-foreground">
                          • {opportunity}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                AI-Generated Action Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.nextSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className="flex-shrink-0 mt-0.5">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{step.task}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant={getPriorityColor(step.priority)} className="text-xs">
                          {step.priority}
                        </Badge>
                        <span>Due: {step.dueDate}</span>
                        <span>•</span>
                        <span>{step.assignee}</span>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs">
                          {step.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Follow-up & Compliance */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Recommendations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Follow-up Recommendations</Label>
                <p className="text-sm text-muted-foreground">{analysis.followUpRecommendations}</p>
              </div>

              {analysis.complianceNotes && (
                <div>
                  <Label className="text-sm font-medium mb-2 block">Compliance Notes</Label>
                  <p className="text-sm text-muted-foreground">{analysis.complianceNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
