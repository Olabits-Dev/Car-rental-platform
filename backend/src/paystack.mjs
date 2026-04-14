import axios from "axios";
import { randomUUID } from "node:crypto";
import { getSql } from "./db.mjs";
import { getPaystackConfig, getAppBaseUrl } from "./env.mjs";

const PAYSTACK_CONFIG = getPaystackConfig();

if (!PAYSTACK_CONFIG) {
  console.warn("[Paystack] Configuration missing - payment features will not work");
}

class PaystackServiceError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = "PaystackServiceError";
    this.statusCode = statusCode;
  }
}

/**
 * Initialize a payment transaction with Paystack
 * @param {string} userId - User ID
 * @param {number} amount - Amount in kobo (NGN/100)
 * @param {string} email - Customer email
 * @param {string} bookingId - Booking ID for reference
 * @returns {Promise<{id: string, authorizationUrl: string, reference: string, accessCode: string}>}
 */
export async function initializePayment(userId, amount, email, bookingId) {
  if (!PAYSTACK_CONFIG) {
    throw new PaystackServiceError(
      "Paystack configuration is missing",
      503,
    );
  }

  try {
    const reference = `BOOKING_${bookingId}_${Date.now()}`;
    const metadata = {
      bookingId,
      userId,
      timestamp: new Date().toISOString(),
    };

    const response = await axios.post(
      `${PAYSTACK_CONFIG.baseUrl}/transaction/initialize`,
      {
        amount,
        email,
        reference,
        metadata,
        callback_url: `${getAppBaseUrl()}/api/payment/verify`,
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_CONFIG.secretKey}`,
          "Content-Type": "application/json",
        },
      },
    );

    if (!response.data.status) {
      throw new PaystackServiceError(
        response.data.message || "Failed to initialize payment",
      );
    }

    const paymentData = response.data.data;
    const sql = getSql();

    // Store payment record
    const paymentId = randomUUID();
    await sql`
      INSERT INTO rideflex_payments
        (id, user_id, amount, reference, access_code, authorization_url, status)
      VALUES
        (${paymentId}, ${userId}, ${amount}, ${reference}, ${paymentData.access_code}, ${paymentData.authorization_url}, 'pending')
    `;

    return {
      id: paymentId,
      authorizationUrl: paymentData.authorization_url,
      reference: reference,
      accessCode: paymentData.access_code,
    };
  } catch (error) {
    if (error instanceof PaystackServiceError) {
      throw error;
    }

    const message = error?.response?.data?.message || error?.message || "Payment initialization failed";
    console.error("[Paystack] Error initializing payment:", message);
    throw new PaystackServiceError(message, 500);
  }
}

/**
 * Verify a payment transaction
 * @param {string} reference - Payment reference
 * @returns {Promise<{status: string, amount: number, reference: string, authorizedAt: string}>}
 */
export async function verifyPayment(reference) {
  if (!PAYSTACK_CONFIG) {
    throw new PaystackServiceError(
      "Paystack configuration is missing",
      503,
    );
  }

  try {
    const response = await axios.get(
      `${PAYSTACK_CONFIG.baseUrl}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_CONFIG.secretKey}`,
        },
      },
    );

    if (!response.data.status) {
      throw new PaystackServiceError(
        response.data.message || "Failed to verify payment",
      );
    }

    const data = response.data.data;
    const sql = getSql();

    // Update payment status
    const paymentStatus = data.status === "success" ? "success" : "failed";
    await sql`
      UPDATE rideflex_payments
      SET status = ${paymentStatus}, updated_at = NOW()
      WHERE reference = ${reference}
    `;

    return {
      status: paymentStatus,
      amount: data.amount,
      reference: data.reference,
      authorizedAt: data.transaction_date,
    };
  } catch (error) {
    if (error instanceof PaystackServiceError) {
      throw error;
    }

    const message = error?.response?.data?.message || error?.message || "Payment verification failed";
    console.error("[Paystack] Error verifying payment:", message);
    throw new PaystackServiceError(message, 500);
  }
}

/**
 * Get payment status
 * @param {string} paymentId - Internal payment ID
 * @returns {Promise<{status: string, amount: number, reference: string}>}
 */
export async function getPaymentStatus(paymentId) {
  try {
    const sql = getSql();
    const result = await sql`
      SELECT id, status, amount, reference
      FROM rideflex_payments
      WHERE id = ${paymentId}
    `;

    if (result.length === 0) {
      throw new PaystackServiceError(
        "Payment not found",
        404,
      );
    }

    const payment = result[0];
    return {
      status: payment.status,
      amount: payment.amount,
      reference: payment.reference,
    };
  } catch (error) {
    if (error instanceof PaystackServiceError) {
      throw error;
    }

    console.error("[Paystack] Error getting payment status:", error?.message || String(error));
    throw new PaystackServiceError("Failed to get payment status", 500);
  }
}

/**
 * Get payment by reference
 * @param {string} reference - Paystack reference
 * @returns {Promise<{id: string, status: string, amount: number, userId: string} | null>}
 */
export async function getPaymentByReference(reference) {
  try {
    const sql = getSql();
    const result = await sql`
      SELECT id, status, amount, user_id
      FROM rideflex_payments
      WHERE reference = ${reference}
    `;

    if (result.length === 0) {
      return null;
    }

    const payment = result[0];
    return {
      id: payment.id,
      status: payment.status,
      amount: payment.amount,
      userId: payment.user_id,
    };
  } catch (error) {
    console.error("[Paystack] Error fetching payment:", error?.message || String(error));
    return null;
  }
}

export { PaystackServiceError };
