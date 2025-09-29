"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mic, Square, Play, Pause, AlertCircle, Shield, SkipBack, SkipForward } from "lucide-react"
import { DemoConversationGenerator } from "./demo-conversation-generator"
import { Slider } from "@/components/ui/slider"
import type { SpeechRecognition } from "speech-recognition"

interface TranscriptSegment {
  id: string
  text: string
  timestamp: number
  speaker?: string
}

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

interface RecordingControlsProps {
  onNewConversation?: (conversation: ConversationSummary) => void
}

export function RecordingControls({ onNewConversation }: RecordingControlsProps) {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [permissionState, setPermissionState] = useState<"unknown" | "granted" | "denied" | "prompt">("unknown")
  const [error, setError] = useState<string | null>(null)
  const [isCheckingPermission, setIsCheckingPermission] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackTime, setPlaybackTime] = useState(0)
  const [audioDuration, setAudioDuration] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const audioElementRef = useRef<HTMLAudioElement | null>(null)
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    checkMicrophonePermission()

    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition
      const recognition = new SpeechRecognition()

      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = "en-US"

      recognition.onresult = (event) => {
        const results = Array.from(event.results)
        const latestResult = results[results.length - 1]

        if (latestResult.isFinal) {
          const newSegment: TranscriptSegment = {
            id: Date.now().toString(),
            text: latestResult[0].transcript,
            timestamp: Date.now(),
            speaker: "Speaker",
          }

          setTranscript((prev) => [...prev, newSegment])
        }
      }

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error)
        if (event.error === "not-allowed") {
          setError("Microphone access was denied. Please allow microphone access and try again.")
          setPermissionState("denied")
        }
      }

      recognitionRef.current = recognition
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close()
      }
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current)
      }
    }
  }, [])

  const checkMicrophonePermission = async () => {
    try {
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: "microphone" as PermissionName })
        setPermissionState(permission.state)

        permission.onchange = () => {
          setPermissionState(permission.state)
        }
      }
    } catch (error) {
      console.log("Permission API not supported, will check on first use")
    }
  }

  const requestMicrophonePermission = async () => {
    setIsCheckingPermission(true)
    setError(null)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((track) => track.stop())
      setPermissionState("granted")
      setError(null)
    } catch (error: any) {
      console.error("Permission request failed:", error)
      setPermissionState("denied")

      if (error.name === "NotAllowedError") {
        setError(
          "Microphone access was denied. Please click the microphone icon in your browser's address bar and allow access, then try again.",
        )
      } else if (error.name === "NotFoundError") {
        setError("No microphone found. Please connect a microphone and try again.")
      } else {
        setError("Unable to access microphone. Please check your browser settings and try again.")
      }
    } finally {
      setIsCheckingPermission(false)
    }
  }

  const startRecording = async () => {
    setError(null)
    audioChunksRef.current = []
    setAudioBlob(null)
    setTranscript([])

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        setAudioBlob(blob)
      }

      mediaRecorder.start(100)
      recognitionRef.current?.start()

      visualizeAudio(stream)

      setIsRecording(true)
      setIsPaused(false)
      setRecordingTime(0)
      setPermissionState("granted")

      intervalRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1)
      }, 1000)
    } catch (error: any) {
      console.error("Error starting recording:", error)
      if (error.name === "NotAllowedError") {
        setError("Microphone access was denied. Please allow microphone access and try again.")
        setPermissionState("denied")
      } else if (error.name === "NotFoundError") {
        setError("No microphone found. Please connect a microphone and try again.")
      } else if (error.name === "NotReadableError") {
        setError("Microphone is already in use by another application.")
      } else {
        setError(`Recording failed: ${error.message || "Unknown error"}`)
      }
    }
  }

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume()
        recognitionRef.current?.start()
        intervalRef.current = setInterval(() => {
          setRecordingTime((prev) => prev + 1)
        }, 1000)
      } else {
        mediaRecorderRef.current.pause()
        recognitionRef.current?.stop()
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
      setIsPaused(!isPaused)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      recognitionRef.current?.stop()
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop())
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close()
      audioContextRef.current = null
    }

    setIsRecording(false)
    setIsPaused(false)
    setIsProcessing(true)

    setTimeout(() => {
      if (transcript.length > 0) {
        const conversationData = analyzeTranscriptAndCreateConversation(transcript, recordingTime)
        if (onNewConversation) {
          onNewConversation(conversationData)
        }
      }
      setIsProcessing(false)
    }, 2000)
  }

  const togglePlayback = () => {
    if (!audioElementRef.current) return

    if (isPlaying) {
      audioElementRef.current.pause()
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current)
      }
    } else {
      audioElementRef.current.play()
      playbackIntervalRef.current = setInterval(() => {
        if (audioElementRef.current) {
          setPlaybackTime(audioElementRef.current.currentTime)
        }
      }, 100)
    }
    setIsPlaying(!isPlaying)
  }

  const seekAudio = (value: number[]) => {
    if (!audioElementRef.current) return
    audioElementRef.current.currentTime = value[0]
    setPlaybackTime(value[0])
  }

  const skipBackward = () => {
    if (!audioElementRef.current) return
    audioElementRef.current.currentTime = Math.max(0, audioElementRef.current.currentTime - 10)
  }

  const skipForward = () => {
    if (!audioElementRef.current) return
    audioElementRef.current.currentTime = Math.min(audioDuration, audioElementRef.current.currentTime + 10)
  }

  useEffect(() => {
    if (audioBlob && audioElementRef.current) {
      const url = URL.createObjectURL(audioBlob)
      audioElementRef.current.src = url
      audioElementRef.current.onloadedmetadata = () => {
        if (audioElementRef.current) {
          setAudioDuration(audioElementRef.current.duration)
        }
      }
      audioElementRef.current.onended = () => {
        setIsPlaying(false)
        if (playbackIntervalRef.current) {
          clearInterval(playbackIntervalRef.current)
        }
      }

      return () => URL.revokeObjectURL(url)
    }
  }, [audioBlob])

  const visualizeAudio = (stream: MediaStream) => {
    const audioContext = new AudioContext()
    const analyser = audioContext.createAnalyser()
    const source = audioContext.createMediaStreamSource(stream)

    analyser.fftSize = 256
    source.connect(analyser)

    audioContextRef.current = audioContext
    analyserRef.current = analyser

    drawWaveform()
  }

  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const analyser = analyserRef.current
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw)

      analyser.getByteTimeDomainData(dataArray)

      ctx.fillStyle = "rgb(15, 23, 42)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      ctx.lineWidth = 2
      ctx.strokeStyle = "rgb(59, 130, 246)"
      ctx.beginPath()

      const sliceWidth = canvas.width / bufferLength
      let x = 0

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0
        const y = (v * canvas.height) / 2

        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }

        x += sliceWidth
      }

      ctx.lineTo(canvas.width, canvas.height / 2)
      ctx.stroke()
    }

    draw()
  }

  const handleDemoTranscript = (demoTranscript: TranscriptSegment[], scenarioData: any) => {
    console.log("[v0] Demo transcript generated:", demoTranscript)
    console.log("[v0] Scenario data:", scenarioData)

    setTranscript(demoTranscript)

    if (onNewConversation && scenarioData) {
      const conversationSummary: ConversationSummary = {
        id: Date.now().toString(),
        clientName: scenarioData.clientName,
        meetingDate: new Date().toISOString().split("T")[0],
        duration: `${Math.floor(demoTranscript.length * 0.5)} minutes`,
        meetingType: scenarioData.meetingType,
        keyTopics: scenarioData.keyTopics,
        summary: scenarioData.summary,
        nextSteps: scenarioData.nextSteps,
      }

      console.log("[v0] Creating conversation summary:", conversationSummary)
      onNewConversation(conversationSummary)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const formatTimestamp = (timestamp: number, startTime: number) => {
    const elapsed = Math.floor((timestamp - startTime) / 1000)
    return formatTime(elapsed)
  }

  const transcriptStartTime = transcript.length > 0 ? transcript[0].timestamp : Date.now()

  const analyzeTranscriptAndCreateConversation = (
    transcriptSegments: TranscriptSegment[],
    duration: number,
  ): ConversationSummary => {
    const fullText = transcriptSegments.map((seg) => seg.text).join(" ")
    const lowerText = fullText.toLowerCase()

    // Extract client name (look for common patterns)
    let clientName = "Client"
    const namePatterns = [
      /(?:client|mr\.|mrs\.|ms\.|dr\.)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/,
      /(?:speaking with|meeting with|talking to)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/,
      /(?:this is|i'm)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/,
    ]
    for (const pattern of namePatterns) {
      const match = fullText.match(pattern)
      if (match && match[1]) {
        clientName = match[1]
        break
      }
    }

    // Identify meeting type based on keywords
    let meetingType = "Client Consultation"
    if (lowerText.includes("portfolio") || lowerText.includes("investment") || lowerText.includes("performance")) {
      meetingType = "Portfolio Review"
    } else if (lowerText.includes("retirement") || lowerText.includes("401k") || lowerText.includes("pension")) {
      meetingType = "Retirement Planning"
    } else if (lowerText.includes("tax") || lowerText.includes("deduction") || lowerText.includes("irs")) {
      meetingType = "Tax Planning"
    } else if (lowerText.includes("estate") || lowerText.includes("will") || lowerText.includes("trust")) {
      meetingType = "Estate Planning"
    } else if (lowerText.includes("insurance") || lowerText.includes("policy") || lowerText.includes("coverage")) {
      meetingType = "Insurance Review"
    }

    // Extract key topics (tags)
    const topics: string[] = []
    const topicKeywords = {
      "Portfolio Management": ["portfolio", "allocation", "rebalance", "diversification", "asset"],
      "Retirement Planning": ["retirement", "401k", "ira", "pension", "social security"],
      "Tax Strategy": ["tax", "deduction", "tax-loss", "capital gains", "tax planning"],
      "Estate Planning": ["estate", "will", "trust", "beneficiary", "inheritance"],
      "Risk Assessment": ["risk", "tolerance", "volatility", "conservative", "aggressive"],
      "Investment Strategy": ["investment", "stocks", "bonds", "mutual funds", "etf"],
      "Insurance Planning": ["insurance", "life insurance", "policy", "coverage", "premium"],
      "Financial Goals": ["goals", "objectives", "target", "milestone", "planning"],
      "Market Analysis": ["market", "economy", "performance", "returns", "benchmark"],
      "ESG Investing": ["esg", "sustainable", "socially responsible", "green", "ethical"],
    }

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some((keyword) => lowerText.includes(keyword))) {
        topics.push(topic)
      }
    }

    // Ensure at least one topic
    if (topics.length === 0) {
      topics.push("General Financial Planning")
    }

    // Extract action items from transcript
    const actionItems: ConversationSummary["nextSteps"] = []
    const actionPhrases = [
      /(?:need to|should|will|must|have to|going to)\s+([^.!?]+)/gi,
      /(?:follow up|reach out|contact|schedule|prepare|review|analyze|research)\s+([^.!?]+)/gi,
      /(?:action item|task|todo|next step):\s*([^.!?]+)/gi,
    ]

    const extractedActions = new Set<string>()
    for (const pattern of actionPhrases) {
      let match
      while ((match = pattern.exec(fullText)) !== null) {
        const action = match[0].trim()
        if (action.length > 20 && action.length < 200) {
          extractedActions.add(action)
        }
      }
    }

    // Convert extracted actions to structured tasks
    let taskId = 1
    for (const action of Array.from(extractedActions).slice(0, 5)) {
      // Limit to 5 tasks
      const actionLower = action.toLowerCase()

      // Determine priority based on keywords
      let priority: "High" | "Medium" | "Low" = "Medium"
      if (
        actionLower.includes("urgent") ||
        actionLower.includes("asap") ||
        actionLower.includes("immediately") ||
        actionLower.includes("critical")
      ) {
        priority = "High"
      } else if (actionLower.includes("when possible") || actionLower.includes("eventually")) {
        priority = "Low"
      }

      // Determine assignee based on task content
      let assignee = "Financial Advisor"
      if (
        actionLower.includes("portfolio") ||
        actionLower.includes("rebalance") ||
        actionLower.includes("allocation")
      ) {
        assignee = "Portfolio Manager"
      } else if (actionLower.includes("tax") || actionLower.includes("deduction")) {
        assignee = "Tax Specialist"
      } else if (actionLower.includes("estate") || actionLower.includes("will") || actionLower.includes("trust")) {
        assignee = "Estate Planning Specialist"
      } else if (actionLower.includes("retirement") || actionLower.includes("planning")) {
        assignee = "Financial Planner"
      } else if (actionLower.includes("compliance") || actionLower.includes("regulation")) {
        assignee = "Compliance Officer"
      }

      // Calculate due date (high priority: 3 days, medium: 7 days, low: 14 days)
      const daysToAdd = priority === "High" ? 3 : priority === "Medium" ? 7 : 14
      const dueDate = new Date()
      dueDate.setDate(dueDate.getDate() + daysToAdd)

      actionItems.push({
        id: taskId++,
        task: action.charAt(0).toUpperCase() + action.slice(1),
        priority,
        dueDate: dueDate.toISOString().split("T")[0],
        assignee,
        status: "pending",
      })
    }

    // If no action items were extracted, create a default follow-up task
    if (actionItems.length === 0) {
      const followUpDate = new Date()
      followUpDate.setDate(followUpDate.getDate() + 7)

      actionItems.push({
        id: 1,
        task: `Follow up with ${clientName} regarding ${meetingType.toLowerCase()} discussion`,
        priority: "Medium",
        dueDate: followUpDate.toISOString().split("T")[0],
        assignee: "Financial Advisor",
        status: "pending",
      })
    }

    // Generate summary
    const summary = `Meeting with ${clientName} covered ${topics.join(", ").toLowerCase()}. ${actionItems.length} action items identified for follow-up. Key discussion points included client objectives, current financial situation, and recommended next steps to achieve their financial goals.`

    return {
      id: Date.now().toString(),
      clientName,
      meetingDate: new Date().toISOString().split("T")[0],
      duration: `${Math.floor(duration / 60)} minutes`,
      meetingType,
      keyTopics: topics,
      summary,
      nextSteps: actionItems,
    }
  }

  return (
    <div className="space-y-6">
      <DemoConversationGenerator onGenerateTranscript={handleDemoTranscript} />

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            {permissionState === "denied" && (
              <Button
                variant="outline"
                size="sm"
                onClick={requestMicrophonePermission}
                disabled={isCheckingPermission}
                className="ml-4 bg-transparent"
              >
                {isCheckingPermission ? "Checking..." : "Request Permission"}
              </Button>
            )}
          </AlertDescription>
        </Alert>
      )}

      {permissionState === "prompt" && !error && (
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Microphone permission is required for recording. Click to grant access.</span>
            <Button variant="outline" size="sm" onClick={requestMicrophonePermission} disabled={isCheckingPermission}>
              {isCheckingPermission ? "Checking..." : "Grant Permission"}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Record Client Conversation
            {permissionState === "granted" && (
              <Badge variant="secondary" className="text-xs">
                <Shield className="h-3 w-3 mr-1" />
                Ready to Record
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {!isRecording ? (
                <Button
                  onClick={startRecording}
                  className="flex items-center gap-2"
                  disabled={permissionState === "denied" || isCheckingPermission}
                >
                  <Mic className="h-4 w-4" />
                  {isCheckingPermission ? "Checking Permission..." : "Start Recording"}
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={pauseRecording} className="flex items-center gap-2 bg-transparent">
                    {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                    {isPaused ? "Resume" : "Pause"}
                  </Button>
                  <Button variant="destructive" onClick={stopRecording} className="flex items-center gap-2">
                    <Square className="h-4 w-4" />
                    Stop
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {isRecording && (
                <Badge variant={isPaused ? "secondary" : "default"} className="flex items-center gap-1">
                  <div className={`h-2 w-2 rounded-full ${isPaused ? "bg-yellow-500" : "bg-red-500 animate-pulse"}`} />
                  {isPaused ? "Paused" : "Recording"}
                </Badge>
              )}
              <div className="text-sm font-mono text-muted-foreground">{formatTime(recordingTime)}</div>
            </div>
          </div>

          {isRecording && !isPaused && (
            <div className="rounded-lg overflow-hidden border border-border">
              <canvas ref={canvasRef} width={800} height={100} className="w-full h-24 bg-slate-950" />
            </div>
          )}

          {isProcessing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Processing conversation...
            </div>
          )}

          {audioBlob && !isRecording && (
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-base">Recording Playback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <audio ref={audioElementRef} className="hidden" />

                <div className="flex items-center gap-4">
                  <Button variant="outline" size="icon" onClick={skipBackward} className="bg-transparent">
                    <SkipBack className="h-4 w-4" />
                  </Button>

                  <Button variant="default" size="icon" onClick={togglePlayback}>
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>

                  <Button variant="outline" size="icon" onClick={skipForward} className="bg-transparent">
                    <SkipForward className="h-4 w-4" />
                  </Button>

                  <div className="flex-1">
                    <Slider
                      value={[playbackTime]}
                      max={audioDuration || 100}
                      step={0.1}
                      onValueChange={seekAudio}
                      className="cursor-pointer"
                    />
                  </div>

                  <div className="text-sm font-mono text-muted-foreground min-w-[80px] text-right">
                    {formatTime(playbackTime)} / {formatTime(audioDuration)}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {transcript.length > 0 && (
            <Card className="bg-muted/50">
              <CardHeader>
                <CardTitle className="text-base">Transcript</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-64 overflow-y-auto space-y-3">
                  {transcript.map((segment) => (
                    <div key={segment.id} className="flex gap-3 text-sm">
                      <span className="text-muted-foreground font-mono text-xs min-w-[50px]">
                        {formatTimestamp(segment.timestamp, transcriptStartTime)}
                      </span>
                      <div className="flex-1">
                        <span className="font-medium text-primary">{segment.speaker}:</span>{" "}
                        <span className="text-foreground">{segment.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
