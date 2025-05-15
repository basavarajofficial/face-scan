import { compare, hash } from "bcryptjs";
import { sign, verify } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return await hash(password, 12);
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await compare(password, hashedPassword)
}

// Generate JWT token
export function generateToken(userId: string): string {
  return sign({ userId }, JWT_SECRET, { expiresIn: "7d" })
}

// Verify JWT token
export function verifyToken(token: string): any {
  try {
    return verify(token, JWT_SECRET)
  } catch (error) {
    return null
  }
}

// Compare face descriptors using Euclidean distance
export function compareFaceDescriptors(descriptor1: Float32Array, descriptor2: Float32Array): number {
  if (descriptor1.length !== descriptor2.length) {
    throw new Error("Face descriptor dimensions do not match")
  }

  let distance = 0
  for (let i = 0; i < descriptor1.length; i++) {
    distance += Math.pow(descriptor1[i] - descriptor2[i], 2)
  }
  distance = Math.sqrt(distance);

  // Convert distance to similarity score (0 to 1)
  // Lower distance means higher similarity
  // A distance of 0 means perfect match (similarity = 1)
  // A distance of 0.6 or higher usually means different faces (similarity < 0.4)
  const similarity = 1 - Math.min(distance, 1);

  return similarity;
}
