"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CheckCircle2, Clock, AlertCircle, Plus, Search, Calendar, User, Tag, Brain, Edit, Trash2 } from "lucide-react"

interface Task {
  id: string
  task: string
  priority: "High" | "Medium" | "Low"
  assignee: string
  assigneeName?: string
  dueDate: string
  category: string
  clientImpact?: string
  estimatedHours?: string
  dependencies?: string[]
  status: "pending" | "in-progress" | "completed" | "overdue"
  clientName?: string
  createdAt: string
  source: "ai-generated" | "manual"
}

const assigneeNames: Record<string, string[]> = {
  "Financial Advisor": ["Michael Rodriguez", "Sarah Chen", "David Thompson"],
  "Portfolio Manager": ["Jennifer Walsh", "Robert Kim", "Lisa Martinez"],
  "Financial Planner": ["Amanda Foster", "James Wilson", "Maria Garcia"],
  "Tax Specialist": ["Thomas Anderson", "Rachel Green", "Kevin Park"],
  "Estate Planning Specialist": ["Catherine Moore", "Daniel Lee", "Susan Taylor"],
  "Compliance Officer": ["Steven Clark", "Laura Phillips", "Andrew Lewis"],
}

interface TranscriptSegment {
  id: string
  text: string
  timestamp: number
  speaker?: string
}

interface TaskManagementPanelProps {
  transcript: TranscriptSegment[]
}

export function TaskManagementPanel({ transcript }: TaskManagementPanelProps) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [isExtracting, setIsExtracting] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [isAddingTask, setIsAddingTask] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  useEffect(() => {
    const sampleTasks: Task[] = [
      {
        id: "1",
        task: "Complete comprehensive estate planning review for Michael Chen including trust structure analysis",
        priority: "High",
        assignee: "Estate Planning Specialist",
        assigneeName: "Catherine Moore",
        dueDate: "2025-09-18",
        category: "estate",
        clientImpact: "Ensure proper asset protection and minimize estate tax liability",
        estimatedHours: "4-5 hours",
        dependencies: ["Client document collection", "Attorney consultation"],
        status: "overdue",
        clientName: "Michael Chen",
        createdAt: "2025-09-10",
        source: "manual",
      },
      {
        id: "2",
        task: "Rebalance portfolio allocation for Jennifer Martinez - reduce tech exposure and increase international diversification",
        priority: "Medium",
        assignee: "Portfolio Manager",
        assigneeName: "Jennifer Walsh",
        dueDate: "2025-09-22",
        category: "portfolio",
        clientImpact: "Optimize risk-adjusted returns and improve portfolio diversification",
        estimatedHours: "2-3 hours",
        status: "pending",
        clientName: "Jennifer Martinez",
        createdAt: "2025-09-12",
        source: "manual",
      },
      {
        id: "3",
        task: "Prepare detailed retirement income projection for Robert Thompson including Social Security optimization",
        priority: "High",
        assignee: "Financial Planner",
        assigneeName: "Amanda Foster",
        dueDate: "2025-09-25",
        category: "planning",
        clientImpact: "Provide clear retirement readiness assessment and income strategy",
        estimatedHours: "4-5 hours",
        status: "in-progress",
        clientName: "Robert Thompson",
        createdAt: "2025-09-14",
        source: "manual",
      },
      {
        id: "4",
        task: "Research and present ESG investment options for Sarah Johnson's portfolio transition",
        priority: "Medium",
        assignee: "Financial Advisor",
        assigneeName: "Sarah Chen",
        dueDate: "2025-09-20",
        category: "research",
        clientImpact: "Align investments with client values while maintaining performance targets",
        estimatedHours: "3-4 hours",
        status: "pending",
        clientName: "Sarah Johnson",
        createdAt: "2025-09-15",
        source: "ai-generated",
      },
      {
        id: "5",
        task: "Prepare tax-loss harvesting analysis for Q4 2024 - identify opportunities across all client accounts",
        priority: "High",
        assignee: "Tax Specialist",
        assigneeName: "Thomas Anderson",
        dueDate: "2025-09-19",
        category: "tax",
        clientImpact: "Minimize tax liability and improve after-tax returns",
        estimatedHours: "6-8 hours",
        status: "in-progress",
        clientName: "Multiple Clients",
        createdAt: "2025-09-08",
        source: "manual",
      },
      {
        id: "6",
        task: "Schedule and conduct insurance needs analysis for the Martinez family",
        priority: "Medium",
        assignee: "Financial Planner",
        assigneeName: "James Wilson",
        dueDate: "2025-09-28",
        category: "insurance",
        clientImpact: "Ensure adequate protection for family and business interests",
        estimatedHours: "2-3 hours",
        status: "pending",
        clientName: "Jennifer Martinez",
        createdAt: "2025-09-16",
        source: "ai-generated",
      },
      {
        id: "7",
        task: "Update investment policy statement for Thompson retirement account",
        priority: "Low",
        assignee: "Financial Advisor",
        assigneeName: "Michael Rodriguez",
        dueDate: "2025-10-05",
        category: "compliance",
        clientImpact: "Ensure investment strategy aligns with updated risk tolerance and goals",
        estimatedHours: "1-2 hours",
        status: "completed",
        clientName: "Robert Thompson",
        createdAt: "2025-09-05",
        source: "manual",
      },
      {
        id: "8",
        task: "Prepare quarterly performance report with benchmark analysis for all equity portfolios",
        priority: "Medium",
        assignee: "Portfolio Manager",
        assigneeName: "Robert Kim",
        dueDate: "2025-09-30",
        category: "client_service",
        clientImpact: "Provide transparent performance reporting and market insights",
        estimatedHours: "5-6 hours",
        status: "pending",
        clientName: "All Clients",
        createdAt: "2025-09-12",
        source: "manual",
      },
    ]
    setTasks(sampleTasks)
    setFilteredTasks(sampleTasks)
  }, [])

  useEffect(() => {
    let filtered = tasks

    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.task.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.assignee.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.assigneeName?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((task) => task.status === statusFilter)
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((task) => task.priority === priorityFilter)
    }

    filtered = filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    setFilteredTasks(filtered)
  }, [tasks, searchTerm, statusFilter, priorityFilter])

  const downloadTasksCSV = () => {
    const headers = [
      "Task ID",
      "Task Description",
      "Priority",
      "Status",
      "Assignee",
      "Assignee Name",
      "Due Date",
      "Category",
      "Client Name",
      "Client Impact",
      "Estimated Hours",
      "Dependencies",
      "Source",
      "Created Date",
    ]

    const csvData = tasks.map((task) => [
      task.id,
      `"${task.task.replace(/"/g, '""')}"`,
      task.priority,
      task.status,
      task.assignee,
      task.assigneeName || "",
      task.dueDate,
      task.category,
      task.clientName || "",
      `"${(task.clientImpact || "").replace(/"/g, '""')}"`,
      task.estimatedHours || "",
      task.dependencies ? `"${task.dependencies.join(", ")}"` : "",
      task.source,
      new Date(task.createdAt).toLocaleDateString(),
    ])

    const csvContent = [headers, ...csvData].map((row) => row.join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `tasks-export-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const updateTaskStatus = (taskId: string, newStatus: Task["status"]) => {
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)))
  }

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== taskId))
  }

  const addNewTask = (newTask: Omit<Task, "id" | "createdAt" | "source">) => {
    const task: Task = {
      ...newTask,
      id: `manual-${Date.now()}`,
      createdAt: new Date().toISOString(),
      source: "manual",
    }
    setTasks((prev) => [task, ...prev])
    setIsAddingTask(false)
  }

  const updateTask = (updatedTask: Task) => {
    setTasks((prev) => prev.map((task) => (task.id === updatedTask.id ? updatedTask : task)))
    setEditingTask(null)
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-success text-success-foreground"
      case "in-progress":
        return "bg-warning text-warning-foreground"
      case "overdue":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-secondary text-secondary-foreground"
    }
  }

  const taskStats = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === "pending").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    completed: tasks.filter((t) => t.status === "completed").length,
    overdue: tasks.filter((t) => t.status === "overdue").length,
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{taskStats.total}</div>
            <div className="text-xs text-muted-foreground">Total Tasks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-muted-foreground">{taskStats.pending}</div>
            <div className="text-xs text-muted-foreground">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-warning">{taskStats.inProgress}</div>
            <div className="text-xs text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-success">{taskStats.completed}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-destructive">{taskStats.overdue}</div>
            <div className="text-xs text-muted-foreground">Overdue</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Task Management
            </span>
            <div className="flex items-center gap-2">
              <Button onClick={downloadTasksCSV} size="sm">
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Download Tasks CSV
                </>
              </Button>
              <TaskDialog
                onSave={addNewTask}
                trigger={
                  <Button size="sm" variant="outline" className="bg-transparent">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                }
              />
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks, clients, or assignees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {transcript.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-4 space-y-2">
              <p>Record a conversation or use the demo generator to enable AI task extraction</p>
              <p className="text-xs">The system can automatically identify action items from client conversations</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tasks ({filteredTasks.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredTasks.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No tasks match your current filters</p>
            ) : (
              filteredTasks.map((task) => (
                <div key={task.id} className="flex items-start gap-3 p-4 rounded-lg border">
                  <div className="flex-shrink-0 mt-0.5">{getStatusIcon(task.status)}</div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <p className="text-sm font-medium leading-relaxed">{task.task}</p>
                      <div className="flex items-center gap-1 ml-2">
                        <TaskDialog
                          task={task}
                          onSave={updateTask}
                          trigger={
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                              <Edit className="h-3 w-3" />
                            </Button>
                          }
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                          onClick={() => deleteTask(task.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <Badge variant={getPriorityColor(task.priority)}>{task.priority}</Badge>
                      <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {task.dueDate}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        {task.assigneeName ? `${task.assigneeName} (${task.assignee})` : task.assignee}
                      </Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Tag className="h-3 w-3" />
                        {task.category}
                      </Badge>
                      {task.source === "ai-generated" && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Brain className="h-3 w-3" />
                          AI
                        </Badge>
                      )}
                    </div>

                    {task.clientName && <p className="text-xs text-muted-foreground">Client: {task.clientName}</p>}

                    {task.clientImpact && (
                      <p className="text-xs text-muted-foreground italic">Impact: {task.clientImpact}</p>
                    )}

                    {task.estimatedHours && (
                      <p className="text-xs text-muted-foreground">Estimated time: {task.estimatedHours}</p>
                    )}

                    <div className="flex items-center gap-2">
                      <Select
                        value={task.status}
                        onValueChange={(value) => updateTaskStatus(task.id, value as Task["status"])}
                      >
                        <SelectTrigger className="w-[120px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

interface TaskDialogProps {
  task?: Task
  onSave: (task: Task | Omit<Task, "id" | "createdAt" | "source">) => void
  trigger: React.ReactNode
}

function TaskDialog({ task, onSave, trigger }: TaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    task: "",
    priority: "Medium" as Task["priority"],
    assignee: "",
    assigneeName: "",
    dueDate: "",
    category: "",
    clientName: "",
    clientImpact: "",
    estimatedHours: "",
    status: "pending" as Task["status"],
  })

  useEffect(() => {
    if (open) {
      if (task) {
        setFormData({
          task: task.task,
          priority: task.priority,
          assignee: task.assignee,
          assigneeName: task.assigneeName || "",
          dueDate: task.dueDate,
          category: task.category,
          clientName: task.clientName || "",
          clientImpact: task.clientImpact || "",
          estimatedHours: task.estimatedHours || "",
          status: task.status,
        })
      } else {
        setFormData({
          task: "",
          priority: "Medium",
          assignee: "",
          assigneeName: "",
          dueDate: "",
          category: "",
          clientName: "",
          clientImpact: "",
          estimatedHours: "",
          status: "pending",
        })
      }
    }
  }, [open, task])

  const handleAssigneeChange = (value: string) => {
    setFormData({ ...formData, assignee: value, assigneeName: "" })
  }

  const handleSave = () => {
    if (!formData.task.trim() || !formData.assignee || !formData.dueDate || !formData.category) {
      console.log("[v0] Missing required fields:", {
        task: formData.task.trim(),
        assignee: formData.assignee,
        dueDate: formData.dueDate,
        category: formData.category,
      })
      return
    }

    console.log("[v0] Saving task:", formData)

    if (task) {
      onSave({ ...task, ...formData } as Task)
    } else {
      onSave(formData as Omit<Task, "id" | "createdAt" | "source">)
    }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{task ? "Edit Task" : "Add New Task"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="task">Task Description *</Label>
            <Textarea
              id="task"
              value={formData.task}
              onChange={(e) => setFormData({ ...formData, task: e.target.value })}
              placeholder="Describe the task..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData({ ...formData, priority: value as Task["priority"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as Task["status"] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="assignee">Assignee Category *</Label>
            <Select value={formData.assignee} onValueChange={handleAssigneeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select assignee category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Financial Advisor">Financial Advisor</SelectItem>
                <SelectItem value="Portfolio Manager">Portfolio Manager</SelectItem>
                <SelectItem value="Financial Planner">Financial Planner</SelectItem>
                <SelectItem value="Tax Specialist">Tax Specialist</SelectItem>
                <SelectItem value="Estate Planning Specialist">Estate Planning Specialist</SelectItem>
                <SelectItem value="Compliance Officer">Compliance Officer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.assignee && assigneeNames[formData.assignee] && (
            <div>
              <Label htmlFor="assigneeName">Assign to Specific Person</Label>
              <Select
                value={formData.assigneeName}
                onValueChange={(value) => setFormData({ ...formData, assigneeName: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  {assigneeNames[formData.assignee].map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="portfolio">Portfolio</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="compliance">Compliance</SelectItem>
                  <SelectItem value="research">Research</SelectItem>
                  <SelectItem value="client_service">Client Service</SelectItem>
                  <SelectItem value="tax">Tax</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="estate">Estate</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="clientName">Client Name</Label>
            <Input
              id="clientName"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              placeholder="Client name (optional)"
            />
          </div>

          <div>
            <Label htmlFor="clientImpact">Client Impact</Label>
            <Textarea
              id="clientImpact"
              value={formData.clientImpact}
              onChange={(e) => setFormData({ ...formData, clientImpact: e.target.value })}
              placeholder="How does this benefit the client?"
            />
          </div>

          <div>
            <Label htmlFor="estimatedHours">Estimated Hours</Label>
            <Input
              id="estimatedHours"
              value={formData.estimatedHours}
              onChange={(e) => setFormData({ ...formData, estimatedHours: e.target.value })}
              placeholder="e.g., 2-3 hours"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} className="bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!formData.task.trim() || !formData.assignee || !formData.dueDate || !formData.category}
            >
              {task ? "Update" : "Add"} Task
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
