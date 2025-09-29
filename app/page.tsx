"use client"

import { useState } from "react"
import { ConversationDashboard } from "@/components/conversation-dashboard"
import { TaskManagementPanel } from "@/components/task-management-panel"
import { FinancialDashboard } from "@/components/financial-dashboard"
import { RecordingControls } from "@/components/recording-controls"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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

export default function Home() {
  const [activeTab, setActiveTab] = useState("dashboard")
  const [conversations, setConversations] = useState<ConversationSummary[]>([])

  const handleNewConversation = (conversation: ConversationSummary) => {
    console.log("[v0] Adding new conversation:", conversation)
    setConversations((prev) => [conversation, ...prev])
    setActiveTab("conversations")
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">ST</span>
              </div>
              <h1 className="text-xl font-semibold text-foreground">SmartAI Task Planner</h1>
            </div>
            <div className="text-sm text-muted-foreground">Professional Conversation Intelligence</div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="tasks">Task Management</TabsTrigger>
            <TabsTrigger value="conversations">Conversations</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">Financial Advisory Dashboard</h2>
              <p className="text-muted-foreground text-balance">
                Comprehensive overview of your practice performance, client engagement, and conversation insights.
              </p>
            </div>

            <RecordingControls onNewConversation={handleNewConversation} />

            <FinancialDashboard />
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">Task Management</h2>
              <p className="text-muted-foreground text-balance">
                Manage all client-related tasks, track progress, and ensure nothing falls through the cracks.
              </p>
            </div>
            <TaskManagementPanel transcript={[]} />
          </TabsContent>

          <TabsContent value="conversations" className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">Conversation History</h2>
              <p className="text-muted-foreground text-balance">
                Review past client conversations, summaries, and generated insights across all your meetings.
              </p>
            </div>
            <ConversationDashboard conversations={conversations} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
