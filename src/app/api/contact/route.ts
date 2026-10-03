import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { name, email, phone, message } = await request.json();

    if (!name || !email || !message) {
      return NextResponse.json(
        {
          error: "Name, email and message are required.",
        },
        { status: 400 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is missing");

      return NextResponse.json(
        {
          error: "Email service is not configured.",
        },
        { status: 500 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: "Website Contact Form <onboarding@resend.dev>",
      to: ["vr81666@gmail.com"],
      replyTo: email,
      subject: `New message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="margin-bottom: 24px;">
            New Contact Form Message
          </h2>

          <p>
            <strong>Name:</strong> ${name}
          </p>

          <p>
            <strong>Email:</strong> ${email}
          </p>

          <p>
            <strong>Phone:</strong> ${phone || "Not provided"}
          </p>

          <p>
            <strong>Message:</strong>
          </p>

          <p style="white-space: pre-wrap;">
            ${message}
          </p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);

      return NextResponse.json(
        {
          error: error.message || "Failed to send email.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Email sent successfully.",
      data,
    });
  } catch (error) {
    console.error("Contact API error:", error);

    return NextResponse.json(
      {
        error: "Something went wrong while sending the email.",
      },
      { status: 500 }
    );
  }
}