import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Shield, UserCheck, UserPlus } from "lucide-react"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="max-w-4xl w-full text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-2">Face Authentication</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">
          Secure your application with advanced facial recognition technology
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-emerald-500" />
              Register
            </CardTitle>
            <CardDescription>Create a new account using facial recognition</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-40 flex items-center justify-center bg-slate-100 rounded-md">
              <Shield className="h-16 w-16 text-slate-300" />
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/register" className="w-full">
              <Button className="w-full">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-emerald-500" />
              Login
            </CardTitle>
            <CardDescription>Access your account using facial recognition</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-40 flex items-center justify-center bg-slate-100 rounded-md">
              <Shield className="h-16 w-16 text-slate-300" />
            </div>
          </CardContent>
          <CardFooter>
            <Link href="/login" className="w-full">
              <Button className="w-full">
                Login Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-12 text-center text-sm text-slate-500">
        <p>Powered by Next.js, face-api.js, and MongoDB</p>
      </div>
    </main>
  )
}
