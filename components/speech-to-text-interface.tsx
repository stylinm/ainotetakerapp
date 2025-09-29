"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mic, Square, Play, Pause, AlertCircle, Shield } from "lucide-react"
import { AIAnalysisPanel } from "./ai-analysis-panel"
import { DemoConversationGenerator } from "./demo-conversation-generator"
import type { SpeechRecognition } from "speech-recognition"

interface TranscriptSegment {
  id: string
  text: string
  timestamp: number
  speaker?: string
}

export function SpeechToTextInterface() {
  const [isRecording, setIsRecording] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [transcript, setTranscript] = useState<TranscriptSegment[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [permissionState, setPermissionState] = useState<"unknown" | "granted" | "denied" | "prompt">("unknown")
  const [error, setError] = useState<string | null>(null)
  const [isCheckingPermission, setIsCheckingPermission] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    checkMicrophonePermission()

    // Initialize speech recognition
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
      // Stop the stream immediately as we just wanted to check permission
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

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder

      mediaRecorder.start()
      recognitionRef.current?.start()

      setIsRecording(true)
      setIsPaused(false)
      setRecordingTime(0)
      setPermissionState("granted")

      // Start timer
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

    setIsRecording(false)
    setIsPaused(false)
    setIsProcessing(true)

    // Simulate processing time
    setTimeout(() => {
      setIsProcessing(false)
    }, 2000)
  }

  const handleDemoTranscript = (demoTranscript: TranscriptSegment[]) => {
    setTranscript(demoTranscript)
  }

  const clearTranscript = () => {
    setTranscript([])
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      {/* Demo Generator */}
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

      {/* Recording Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Audio Recording
              {permissionState === "granted" && (
                <Badge variant="secondary" className="text-xs">
                  <Shield className="h-3 w-3 mr-1" />
                  Mic Access Granted
                </Badge>
              )}
            </span>
            {transcript.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearTranscript} className="bg-transparent">
                Clear Transcript
              </Button>
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

          {isProcessing && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Processing conversation...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs for transcript and AI analysis */}
      <Tabs defaultValue="transcript" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="transcript">
            Live Transcript {transcript.length > 0 && `(${transcript.length})`}
          </TabsTrigger>
          <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="transcript" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Conversation Transcript</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {transcript.length === 0 ? (
                  <div className="text-center py-8 space-y-4">
                    <p className="text-muted-foreground">No conversation recorded yet.</p>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>Try the demo conversation generator above, or</p>
                      <p>Start recording to see live transcript here</p>
                    </div>
                  </div>
                ) : (
                  transcript.map((segment) => (
                    <div key={segment.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="flex-shrink-0 space-y-1">
                        <Badge variant="outline" className="text-xs">
                          {formatTimestamp(segment.timestamp)}
                        </Badge>
                        {segment.speaker && (
                          <Badge
                            variant={segment.speaker === "Advisor" ? "default" : "secondary"}
                            className="text-xs block text-center"
                          >
                            {segment.speaker}
                          </Badge>
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm leading-relaxed">{segment.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          <AIAnalysisPanel transcript={transcript} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
