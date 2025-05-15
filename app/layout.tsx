import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import type { Metadata } from "next"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Face Authentication App",
  description: "Secure your application with facial recognition",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Add face-api.js models */}
        <link rel="preload" as="fetch" href="/models/tiny_face_detector_model-weights_manifest.json" />
        <link rel="preload" as="fetch" href="/models/face_landmark_68_model-weights_manifest.json" />
        <link rel="preload" as="fetch" href="/models/face_recognition_model-weights_manifest.json" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
