import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

/**
 * Verify the webhook signature from Paystack
 * @param {string} signature - The X-Paystack-Signature header value
 * @param {Buffer} body - The raw request body
 * @param {string} secret - The Paystack secret key
 * @returns {boolean} Whether the signature is valid
 */
function verifyPaystackSignature(
  signature: string | null,
  body: Buffer,
  secret: string
): boolean {
  if (!signature || !secret) {
    return false;
  }

  try {
    const hash = crypto
      .createHmac("sha512", secret)
      .update(body)
      .digest("hex");

    return signature === hash;
  } catch (error) {
    console.error("Signature verification error:", error);
    return false;
  }
}

/**
 * Handle Paystack webhook events
 * This endpoint processes payment status updates from Paystack
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body for signature verification
    const body = await request.arrayBuffer();
    const signature = request.headers.get("x-paystack-signature");
    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (!secret) {
      console.error("Paystack secret key not configured");
      return NextResponse.json(
        { error: "Configuration error" },
        { status: 500 }
      );
    }

    // Verify the webhook signature
    if (!verifyPaystackSignature(signature, Buffer.from(body), secret)) {
      console.warn("Invalid Paystack webhook signature");
      return NextResponse.json(
        { error: "Invalid signature" },
        { status: 401 }
      );
    }

    // Parse the JSON body
    const event = JSON.parse(Buffer.from(body).toString("utf-8"));

    // Only process charge.success events
    if (event.event !== "charge.success") {
      return NextResponse.json(
        { message: "Event processed" },
        { status: 200 }
      );
    }

    const data = event.data;
    const reference = data.reference;

    if (!reference) {
      return NextResponse.json(
        { error: "Missing reference" },
        { status: 400 }
      );
    }

    // Update payment in database
    const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:3001";
    const webhookResponse = await fetch(`${backendUrl}/api/payment/webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Secret": secret, // Additional security layer
      },
      body: JSON.stringify({
        reference,
        status: "success",
        amount: data.amount,
        timestamp: data.paid_at,
      }),
    });

    if (!webhookResponse.ok) {
      console.error("Failed to process webhook in backend");
      return NextResponse.json(
        { error: "Backend processing failed" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Webhook processed successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Paystack may test the webhook with GET requests
export async function GET() {
  return NextResponse.json(
    { message: "Webhook endpoint is ready" },
    { status: 200 }
  );
}
