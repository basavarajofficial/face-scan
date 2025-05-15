"use client"

import type React from "react"
import LoginComp from "@/components/LoginComp"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

export default function Login() {


  return (
    <Suspense fallback={
    <div className="flex items-center justify-center h-screen"><Loader2 className="animate-spin" /></div>}>
        <LoginComp/>
   </Suspense>
  )
}
