"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TrendingUp, AlertCircle, CheckCircle2, Clock, DollarSign, FileText, Calendar, User } from "lucide-react"
import { useState } from "react"

interface ConversationSummary {
  id: string
  clientName: string
  meetingDate: string
  duration: string
  meetingType: string
  keyTopics: string[]
  summary: string
  nextSteps: Array<{
    id: number
    task: string
    priority: string
    dueDate: string
    assignee: string
    status: string
  }>
}

interface ConversationDashboardProps {
  conversations: ConversationSummary[]
}

// Sample data for demonstration when no conversations exist
const sampleSummary = {
  clientName: "Sarah Johnson",
  meetingDate: "2024-01-15",
  duration: "45 minutes",
  meetingType: "Quarterly Portfolio Review",
  keyTopics: [
    "Portfolio Performance Review",
    "Risk Tolerance Assessment",
    "Retirement Planning Strategy",
    "Tax Optimization Opportunities",
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
      task: "Schedule follow-up call to review ESG options",
      priority: "Medium",
      dueDate: "2024-01-30",
      assignee: "Financial Advisor",
      status: "pending",
    },
    {
      id: 4,
      task: "Update client risk profile documentation",
      priority: "Low",
      dueDate: "2024-02-05",
      assignee: "Client Services",
      status: "completed",
    },
  ],
}

const sampleTasks = [
  {
    id: 5,
    client: "Michael Chen",
    task: "Complete estate planning review",
    priority: "High",
    dueDate: "2024-01-18",
    status: "overdue",
  },
  {
    id: 6,
    client: "Jennifer Martinez",
    task: "Rebalance portfolio allocation",
    priority: "Medium",
    dueDate: "2024-01-22",
    status: "pending",
  },
  {
    id: 7,
    client: "Robert Thompson",
    task: "Prepare retirement income projection",
    priority: "High",
    dueDate: "2024-01-25",
    status: "in-progress",
  },
]

export function ConversationDashboard({ conversations }: ConversationDashboardProps) {
  const [selectedConversation, setSelectedConversation] = useState<ConversationSummary | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const latestConversation = conversations.length > 0 ? conversations[0] : sampleSummary

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-success" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-warning" />
      case "overdue":
        return <AlertCircle className="h-4 w-4 text-destructive" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const handleViewDetails = (conversation: ConversationSummary) => {
    setSelectedConversation(conversation)
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-6">
      {/* Latest Conversation Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {conversations.length > 0 ? "Latest Generated Conversation" : "Sample Conversation Summary"}
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleViewDetails(conversations.length > 0 ? conversations[0] : { ...sampleSummary, id: "sample" })
              }
            >
              View Details
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{latestConversation.clientName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>{latestConversation.meetingDate}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>{latestConversation.duration}</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span>{latestConversation.meetingType}</span>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="font-medium mb-2">Key Topics Discussed</h4>
            <div className="flex flex-wrap gap-2">
              {latestConversation.keyTopics.map((topic, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {topic}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Meeting Summary</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{latestConversation.summary}</p>
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5" />
            Action Items from Latest Meeting
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {latestConversation.nextSteps.map((step) => (
              <div key={step.id} className="flex items-start gap-3 p-3 rounded-lg border">
                <div className="flex-shrink-0 mt-0.5">{getStatusIcon(step.status)}</div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{step.task}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant={getPriorityColor(step.priority)} className="text-xs">
                      {step.priority}
                    </Badge>
                    <span>Due: {step.dueDate}</span>
                    <span>•</span>
                    <span>{step.assignee}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All Conversations */}
      {conversations.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              All Conversations ({conversations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {conversations.map((conversation) => (
                <div key={conversation.id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium">{conversation.clientName}</p>
                    <p className="text-xs text-muted-foreground">
                      {conversation.meetingType} • {conversation.meetingDate}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {conversation.nextSteps.length} tasks
                    </Badge>
                    <span className="text-xs text-muted-foreground">{conversation.duration}</span>
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(conversation)}>
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Tasks Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            All Client Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sampleTasks.map((task) => (
              <div key={task.id} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">{getStatusIcon(task.status)}</div>
                  <div>
                    <p className="text-sm font-medium">{task.task}</p>
                    <p className="text-xs text-muted-foreground">Client: {task.client}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getPriorityColor(task.priority)} className="text-xs">
                    {task.priority}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{task.dueDate}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t">
            <Button variant="outline" className="w-full bg-transparent">
              View All Tasks
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal for displaying full conversation details */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Conversation Details
            </DialogTitle>
          </DialogHeader>

          {selectedConversation && (
            <div className="space-y-6">
              {/* Client and Meeting Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Client Name</p>
                  <p className="font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    {selectedConversation.clientName}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Meeting Date</p>
                  <p className="font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {selectedConversation.meetingDate}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    {selectedConversation.duration}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Meeting Type</p>
                  <p className="font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    {selectedConversation.meetingType}
                  </p>
                </div>
              </div>

              <Separator />

              {/* Key Topics */}
              <div>
                <h4 className="font-semibold mb-3">Key Topics Discussed</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedConversation.keyTopics.map((topic, index) => (
                    <Badge key={index} variant="outline">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Meeting Summary */}
              <div>
                <h4 className="font-semibold mb-3">Meeting Summary</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{selectedConversation.summary}</p>
              </div>

              <Separator />

              {/* Action Items */}
              <div>
                <h4 className="font-semibold mb-3">Action Items ({selectedConversation.nextSteps.length})</h4>
                <div className="space-y-3">
                  {selectedConversation.nextSteps.map((step) => (
                    <div key={step.id} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/30">
                      <div className="flex-shrink-0 mt-0.5">{getStatusIcon(step.status)}</div>
                      <div className="flex-1 space-y-2">
                        <p className="text-sm font-medium">{step.task}</p>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <Badge variant={getPriorityColor(step.priority)} className="text-xs">
                            {step.priority} Priority
                          </Badge>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span>Due: {step.dueDate}</span>
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <User className="h-3 w-3" />
                            <span>{step.assignee}</span>
                          </div>
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              step.status === "completed"
                                ? "border-green-500 text-green-700"
                                : step.status === "in-progress"
                                  ? "border-yellow-500 text-yellow-700"
                                  : step.status === "overdue"
                                    ? "border-red-500 text-red-700"
                                    : ""
                            }`}
                          >
                            {step.status.charAt(0).toUpperCase() + step.status.slice(1)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
