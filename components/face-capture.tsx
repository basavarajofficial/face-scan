"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Loader2, Camera, RefreshCw } from "lucide-react"
import * as faceapi from "face-api.js"

interface FaceCaptureProps {
  onCapture: (descriptor: Float32Array) => void
}

export default function FaceCapture({ onCapture }: FaceCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isModelLoading, setIsModelLoading] = useState(true)
  const [isCameraReady, setIsCameraReady] = useState(false)
  const [isCapturing, setIsCapturing] = useState(false)
  const [captureError, setCaptureError] = useState("")

  useEffect(() => {
    const loadModels = async () => {
      try {
        setIsModelLoading(true)

        // Load face-api models
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/weights"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/weights"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/weights"),
        ])

        setIsModelLoading(false)
        startVideo()
      } catch (error) {
        console.error("Error loading face-api models:", error)
        setCaptureError("Failed to load face recognition models")
        setIsModelLoading(false)
      }
    }

    loadModels()

    return () => {
      // Clean up video stream when component unmounts
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream
        const tracks = stream.getTracks()
        tracks.forEach((track) => track.stop())
      }
    }
  }, [])

  const startVideo = async () => {
    setCaptureError("")
    setIsLoading(true)

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
          },
        })

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.onloadedmetadata = () => {
            setIsLoading(false)
            setIsCameraReady(true)
          }
        }
      } else {
        setCaptureError("Camera access not supported in this browser")
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Error accessing camera:", error)
      setCaptureError("Failed to access camera. Please ensure camera permissions are granted.")
      setIsLoading(false)
    }
  }

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current || !isCameraReady) return

    setIsCapturing(true)
    setCaptureError("")

    try {
      const video = videoRef.current
      const canvas = canvasRef.current
      const displaySize = { width: video.videoWidth, height: video.videoHeight }

      // Match canvas size to video
      faceapi.matchDimensions(canvas, displaySize)

      // Detect faces
      const detections = await faceapi
        .detectSingleFace(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor()

      if (!detections) {
        setCaptureError("No face detected. Please ensure your face is clearly visible.")
        setIsCapturing(false)
        return
      }

      // Draw face detection results on canvas
      const resizedDetections = faceapi.resizeResults(detections, displaySize)

      canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height);
      faceapi.draw.drawDetections(canvas, [resizedDetections]);
      faceapi.draw.drawFaceLandmarks(canvas, [resizedDetections]);

      // Pass face descriptor to parent component
      onCapture(detections.descriptor);
    } catch (error) {
      console.error("Error capturing face:", error)
      setCaptureError("An error occurred while capturing your face")
    } finally {
      setIsCapturing(false)
    }
  }

  const resetCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      const tracks = stream.getTracks()
      tracks.forEach((track) => track.stop())

      if (canvasRef.current) {
        const context = canvasRef.current.getContext("2d")
        if (context) context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
      }

      startVideo()
    }
  }

  return (
    <div className="space-y-4">
      <Card className="relative overflow-hidden rounded-md bg-slate-200 aspect-video flex items-center justify-center">
        {(isLoading || isModelLoading) && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
            <span className="ml-2 text-slate-500">
              {isModelLoading ? "Loading face recognition..." : "Starting camera..."}
            </span>
          </div>
        )}

        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`w-full h-full object-cover ${isCameraReady ? "block" : "hidden"}`}
        />

        <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full" />

        {captureError && (
          <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white p-2 text-sm text-center">
            {captureError}
          </div>
        )}
      </Card>

      <div className="flex gap-2">
        <Button
          type="button"
          onClick={captureImage}
          disabled={isLoading || isModelLoading || isCapturing || !isCameraReady}
          className="flex-1"
        >
          {isCapturing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Capturing...
            </>
          ) : (
            <>
              <Camera className="mr-2 h-4 w-4" />
              Capture Face
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={resetCamera}
          disabled={isLoading || isModelLoading || isCapturing || !isCameraReady}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
