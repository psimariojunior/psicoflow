import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/email"

export async function GET() {
  const apiKey = process.env.RESEND_API_KEY
  const emailFrom = process.env.EMAIL_FROM
  return NextResponse.json({
    hasApiKey: !!apiKey,
    apiKeyPrefix: apiKey ? apiKey.substring(0, 6) : null,
    emailFrom,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
  })
}