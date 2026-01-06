import { type NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"

export async function POST(request: NextRequest) {
  try {
    const { fullName, walletId, paymentScreenshot, userId } = await request.json()

    if (!fullName || !walletId || !paymentScreenshot) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    const transporter = nodemailer.createTransport({
      // host: process.env.SMTP_HOST || "smtp.gmail.com",
      // port: Number.parseInt(process.env.SMTP_PORT || "587"),
      // secure: process.env.SMTP_SECURE === "true",
      service: "gmail",
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    const adminEmail = process.env.ADMIN_EMAIL
    const fromEmail = process.env.EMAIL_FROM

    if (!adminEmail) {
      console.error("[v0] ADMIN_EMAIL environment variable is not set")
      return NextResponse.json({ error: "Email configuration error" }, { status: 500 })
    }

    const emailResult = await transporter.sendMail({
      from: fromEmail,
      to: adminEmail,
      subject: "New Investment Submission",
      html: `
        <h2>New Investment Submission</h2>
        <p><strong>Full Name:</strong> ${fullName}</p>
        <p><strong>Wallet ID:</strong> ${walletId}</p>
        <p><strong>Payment Screenshot:</strong></p>
        <img src="${paymentScreenshot}" alt="Payment Screenshot" style="max-width: 500px;" />
        <hr />
        <p><small>Submitted by user ID: ${userId}</small></p>
      `,
    })

    console.log("[v0] Email sent:", emailResult.messageId)

    return NextResponse.json({ success: true, message: "Investment submission sent to admin" })
  } catch (error) {
    console.error("[v0] Error submitting investment:", error)
    return NextResponse.json({ error: "Failed to submit investment" }, { status: 500 })
  }
}
