"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Check, AlertCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FaceCapture from "@/components/face-capture"

export default function Login() {
    // for pages/:
    const router = useRouter()
    const [email, setEmail] = useState("")
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || undefined;
  const [password, setPassword] = useState("")
  const [faceDescriptor, setFaceDescriptor] = useState<Float32Array | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [activeTab, setActiveTab] = useState("password")

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          method: "password",
        }),
      })

      console.log("response from email login", response);


      const data = await response.json();

      if (response.ok) {
        // first preference: the callbackUrl param
        const dest = callbackUrl || "/dashboard";
        router.push(dest);
      }

      if (!response.ok) {
        throw new Error(data.message || "Login failed")
      }

      // Redirect to dashboard
      sessionStorage.setItem("auth_mode", "credentials");
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "An error occurred during login")
    } finally {
      setLoading(false)
    }
  }

  const handleFaceLogin = async () => {
    if (!faceDescriptor) {
      setError("Please capture your face before logging in")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          faceDescriptor: Array.from(faceDescriptor),
          method: "face",
        }),
      })

      console.log("response from face login", response);

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Face authentication failed")
      }

      // Redirect to dashboard
      sessionStorage.setItem("auth_mode", "facial recognition");
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.message || "An error occurred during face authentication")
    } finally {
      setLoading(false)
    }
  }

  const handleFaceCapture = (descriptor: Float32Array) => {
    setFaceDescriptor(descriptor)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-50 to-slate-100">
      <Card className="w-full max-w-lg shadow-lg">
        <CardHeader>
          <CardTitle>Login to Your Account</CardTitle>
          <CardDescription>Access your account using password or facial recognition</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="password" onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="password">Password</TabsTrigger>
              <TabsTrigger value="face">Face Recognition</TabsTrigger>
            </TabsList>

            <TabsContent value="password">
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login with Password"
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="face">
              <div className="space-y-4">
                <FaceCapture onCapture={handleFaceCapture} />

                {faceDescriptor && (
                  <div className="flex items-center mt-2 text-sm text-emerald-600">
                    <Check className="mr-1 h-4 w-4" />
                    Face captured successfully
                  </div>
                )}

                <Button onClick={handleFaceLogin} className="w-full" disabled={loading || !faceDescriptor}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    "Login with Face"
                  )}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" onClick={() => router.push("/register")} disabled={loading}>
            Don&apos;t have an account? Register
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
