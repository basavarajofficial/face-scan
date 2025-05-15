"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { LogOut, User, Shield, Settings } from "lucide-react"

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch("/api/user")

        if (!response.ok) {
          throw new Error("Not authenticated")
        }

        const data = await response.json()
        setUser(data.user);

      } catch (error) {
        // Redirect to login if not authenticated
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [router]);

    useEffect(() => {
      const authMode = sessionStorage.getItem("auth_mode");
      setAuthMode(authMode);
    }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" });
        sessionStorage.removeItem("auth_mode");
      router.push("/login")
    } catch (error) {
      console.error("Logout failed", error)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  console.log(user);


  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-slate-900">Face Auth Dashboard</h1>

          <div className="flex items-center gap-4">
            <Avatar>
              <AvatarFallback>{user?.name?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>

            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Welcome, {user?.name || "User"}!</h2>
          <p className="text-slate-600">You've successfully authenticated with facial recognition.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-emerald-500" />
                Profile
              </CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="text-sm font-medium text-slate-500">Name</span>
                  <p>{user?.name || "N/A"}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-500">Email</span>
                  <p>{user?.email || "N/A"}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-slate-500">Authentication Method</span>
                  <p>{authMode || "N/A"}    </p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-emerald-500" />
                Security
              </CardTitle>
              <CardDescription>Manage your security settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Face Authentication</p>
                    <p className="text-sm text-slate-500">Login using facial recognition</p>
                  </div>
                  <div className="h-6 w-12 bg-emerald-100 rounded-full flex items-center p-1">
                    <div className="h-4 w-4 rounded-full bg-emerald-500 ml-auto"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Password Authentication</p>
                    <p className="text-sm text-slate-500">Login using password</p>
                  </div>
                  <div className="h-6 w-12 bg-emerald-100 rounded-full flex items-center p-1">
                    <div className="h-4 w-4 rounded-full bg-emerald-500 ml-auto"></div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                <Shield className="h-4 w-4 mr-2" />
                Update Security
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your recent login activity</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-l-2 border-emerald-500 pl-4 py-1">
                  <p className="font-medium">Successful Login</p>
                  <p className="text-sm text-slate-500">Just now • Face Authentication</p>
                </div>

                <div className="border-l-2 border-slate-200 pl-4 py-1">
                  <p className="font-medium">Account Created</p>
                  <p className="text-sm text-slate-500">{new Date().toLocaleDateString()} • Registration</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                View All Activity
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}
