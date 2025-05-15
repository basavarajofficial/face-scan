import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { connectToDatabase } from "@/lib/mongodb"
import { verifyToken } from "@/lib/auth"
import { ObjectId } from "mongodb"

export async function GET() {
  try {
    // Get token from cookies
    const token = (await cookies()).get("auth_token")?.value

    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 })
    }

    // Verify token
    const payload = verifyToken(token)
    if (!payload || !payload.userId) {
      return NextResponse.json({ message: "Invalid token" }, { status: 401 })
    }

    // Connect to MongoDB
    const { db } = await connectToDatabase()

    // Find user by ID
    const user = await db.collection("users").findOne({
      _id: new ObjectId(payload.userId),
    })

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Return user data (excluding sensitive information)
    const { password, faceDescriptor, ...userData } = user

    return NextResponse.json({ user: userData })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ message: "An error occurred while fetching user data" }, { status: 500 })
  }
}
