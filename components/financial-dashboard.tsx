"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { FileText, Clock } from "lucide-react"

// Sample data for the dashboard
const taskCategoryData = [
  { name: "Portfolio Management", value: 35, color: "#22c55e" },
  { name: "Financial Planning", value: 28, color: "#3b82f6" },
  { name: "Tax Planning", value: 18, color: "#f59e0b" },
  { name: "Estate Planning", value: 12, color: "#8b5cf6" },
  { name: "Insurance Review", value: 7, color: "#ef4444" },
]

const recentConversations = [
  {
    id: 1,
    clientName: "Sarah Johnson",
    date: "2024-01-15",
    type: "Portfolio Review",
    sentiment: "positive",
    keyTopics: ["Performance Review", "ESG Investing", "Tax Optimization"],
    nextSteps: 3,
    priority: "Medium",
  },
  {
    id: 2,
    clientName: "Michael Chen",
    date: "2024-01-14",
    type: "Estate Planning",
    sentiment: "concerned",
    keyTopics: ["Trust Setup", "Asset Protection", "Succession Planning"],
    nextSteps: 5,
    priority: "High",
  },
  {
    id: 3,
    clientName: "Jennifer Martinez",
    date: "2024-01-12",
    type: "Retirement Planning",
    sentiment: "positive",
    keyTopics: ["401k Optimization", "Social Security", "Healthcare Costs"],
    nextSteps: 2,
    priority: "Low",
  },
  {
    id: 4,
    clientName: "Robert Thompson",
    date: "2024-01-10",
    type: "Investment Review",
    sentiment: "neutral",
    keyTopics: ["Risk Assessment", "Diversification", "Market Outlook"],
    nextSteps: 4,
    priority: "Medium",
  },
]

const upcomingTasks = [
  {
    id: 1,
    task: "Prepare quarterly performance report for Johnson family",
    client: "Sarah Johnson",
    dueDate: "2024-01-18",
    priority: "High",
    category: "portfolio",
  },
  {
    id: 2,
    task: "Schedule estate planning follow-up meeting",
    client: "Michael Chen",
    dueDate: "2024-01-20",
    priority: "High",
    category: "estate",
  },
  {
    id: 3,
    task: "Research ESG fund options for client portfolio",
    client: "Sarah Johnson",
    dueDate: "2024-01-22",
    priority: "Medium",
    category: "research",
  },
  {
    id: 4,
    task: "Complete risk tolerance assessment update",
    client: "Jennifer Martinez",
    dueDate: "2024-01-25",
    priority: "Medium",
    category: "planning",
  },
  {
    id: 5,
    task: "Prepare tax-loss harvesting analysis",
    client: "Robert Thompson",
    dueDate: "2024-01-28",
    priority: "Low",
    category: "tax",
  },
]

export function FinancialDashboard() {
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
      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Conversations */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Conversations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentConversations.map((conversation) => (
                <div key={conversation.id} className="flex items-start gap-4 p-4 rounded-lg border">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-medium text-primary">
                      {conversation.clientName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{conversation.clientName}</p>
                        <p className="text-xs text-muted-foreground">
                          {conversation.type} • {conversation.date}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getSentimentColor(conversation.sentiment)} variant="secondary">
                          {conversation.sentiment}
                        </Badge>
                        <Badge variant={getPriorityColor(conversation.priority)}>{conversation.priority}</Badge>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {conversation.keyTopics.map((topic, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {topic}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{conversation.nextSteps} action items generated</span>
                      <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingTasks.map((task) => (
                <div key={task.id} className="p-3 rounded-lg border">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-medium leading-tight">{task.task}</p>
                    <Badge variant={getPriorityColor(task.priority)} className="ml-2 flex-shrink-0">
                      {task.priority}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Client: {task.client}</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground">Due: {task.dueDate}</p>
                      <Badge variant="outline" className="text-xs">
                        {task.category}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4 bg-transparent">
              View All Tasks
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
