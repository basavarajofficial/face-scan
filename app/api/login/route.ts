import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { connectToDatabase } from "@/lib/mongodb"
import { verifyPassword, generateToken, compareFaceDescriptors } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { method } = body

    // Connect to MongoDB
    const { db } = await connectToDatabase();

    let user;

    if (method === "password") {
      const { email, password } = body;

      // Validate input
      if (!email || !password) {
        return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
      }

      // Find user by email
      user = await db.collection("users").findOne({ email })
      if (!user) {
        return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
      }

      // Verify password
      const isPasswordValid = await verifyPassword(password, user.password)
      if (!isPasswordValid) {
        return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
      }
    } else if (method === "face") {
      const { faceDescriptor } = body

      // Validate input
      if (!faceDescriptor) {
        return NextResponse.json({ message: "Face data is required" }, { status: 400 })
      }

      // Find all users
      const users = await db.collection("users").find({}).toArray()

      // Find user with matching face
      let matchedUser = null
      let highestSimilarity = 0

      for (const u of users) {
        if (u.faceDescriptor) {
          const similarity = compareFaceDescriptors(
            new Float32Array(faceDescriptor),
            new Float32Array(u.faceDescriptor),
          )

          // Threshold for face similarity (0.6 is a good starting point, adjust as needed)
          if (similarity > 0.6 && similarity > highestSimilarity) {
            highestSimilarity = similarity
            matchedUser = u
            console.log("matched user",matchedUser );
          }
        }
      }

      if (!matchedUser) {
        return NextResponse.json({ message: "Face not recognized" }, { status: 401 })
      }

      user = matchedUser
    } else {
      return NextResponse.json({ message: "Invalid authentication method" }, { status: 400 })
    }

    // Generate JWT token
    const token = generateToken(user._id.toString());

    const cookieStore = await cookies();

    // Set cookie
    cookieStore.set({
      name: "auth_token",
      value: token,
      httpOnly: true,
      path: "/",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    })

    // Return user data (excluding sensitive information)
    const { password: _, faceDescriptor: __, ...userData } = user

    return NextResponse.json({
      message: "Login successful",
      user: userData,
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "An error occurred during login" }, { status: 500 })
  }
}
