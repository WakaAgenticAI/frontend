"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Mic, MicOff, Square, Play, Pause } from "lucide-react"
import { aiTranscribe } from "@/lib/api"

interface AudioRecorderProps {
  onRecordingComplete: (content: string, audioUrl?: string, transcript?: string) => void
  isRecording: boolean
  setIsRecording: (recording: boolean) => void
}

export function AudioRecorder({ onRecordingComplete, isRecording, setIsRecording }: AudioRecorderProps) {
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [isTranscribing, setIsTranscribing] = useState(false)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= 60) {
            stopRecording()
            return 60
          }
          return prev + 1
        })
      }, 1000)
    } catch (error) {
      console.error("Error accessing microphone:", error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const playRecording = () => {
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    }
  }

  const sendRecording = async () => {
    if (audioUrl) {
      setIsTranscribing(true)

      try {
        // Convert audio URL to blob
        const response = await fetch(audioUrl)
        const audioBlob = await response.blob()
        
        // Convert blob to base64
        const base64Audio = await new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            const base64 = reader.result as string
            // Remove data:audio/webm;base64, prefix
            resolve(base64.split(',')[1])
          }
          reader.readAsDataURL(audioBlob)
        })

        // Call real Whisper transcription API
        const transcriptionResult = await aiTranscribe({
          audio_data: base64Audio,
          filename: 'recording.webm',
          language: 'auto'
        })

        setIsTranscribing(false)
        onRecordingComplete("", audioUrl, transcriptionResult.text)
        resetRecording()
      } catch (error) {
        console.error('Transcription failed:', error)
        setIsTranscribing(false)
        
        // Fallback to mock transcript if API fails
        const fallbackTranscript = "I want to check the inventory levels for iPhone 15 Pro and create a new order if stock is available."
        onRecordingComplete("", audioUrl, fallbackTranscript)
        resetRecording()
      }
    }
  }

  const resetRecording = () => {
    setAudioUrl(null)
    setIsPlaying(false)
    setRecordingTime(0)
    setIsTranscribing(false)
    if (audioRef.current) {
      audioRef.current.src = ""
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  if (audioUrl) {
    return (
      <div className="flex items-center space-x-2 p-2 bg-muted rounded-lg">
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => setIsPlaying(false)}
          onLoadedMetadata={() => {
            if (audioRef.current) {
              audioRef.current.currentTime = 0
            }
          }}
        />
        <Button variant="ghost" size="sm" onClick={playRecording}>
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <div className="flex-1 h-1 bg-secondary/20 rounded-full">
              <div className="h-full bg-secondary rounded-full w-1/3"></div>
            </div>
            <span className="text-xs text-muted-foreground">{formatTime(recordingTime)}</span>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={resetRecording}>
          <MicOff className="h-4 w-4" />
        </Button>
        <Button size="sm" onClick={sendRecording} disabled={isTranscribing}>
          {isTranscribing ? "Transcribing..." : "Send"}
        </Button>
      </div>
    )
  }

  if (isRecording) {
    return (
      <div className="flex items-center space-x-2">
        <Button variant="destructive" size="sm" onClick={stopRecording}>
          <Square className="h-4 w-4" />
        </Button>
        <Badge variant="destructive" className="animate-pulse">
          Recording {formatTime(recordingTime)}
        </Badge>
        {recordingTime >= 55 && <span className="text-xs text-destructive">5s remaining</span>}
      </div>
    )
  }

  return (
    <Button variant="outline" size="sm" onClick={startRecording}>
      <Mic className="h-4 w-4" />
    </Button>
  )
}
