"use client";

import type {
  BookingWithCar,
  InquiryStatus,
  InquiryWithContext,
  PublicUser,
} from "@/lib/types";

// Error handling
export class ApiClientError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

// Type definitions for API requests/responses
export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  name: string;
  email: string;
  password: string;
};

export type AuthResponse = {
  user: PublicUser;
};

export type ForgotPasswordRequest = {
  email: string;
};

export type ForgotPasswordResponse = {
  ok: true;
  previewUrl?: string;
};

export type ResetPasswordRequest = {
  token: string;
  password: string;
};

export type BookingRequest = {
  carId: string;
  startDate: string;
  endDate: string;
  offerCode?: string;
};

export type BookingResponse = {
  booking: BookingWithCar;
};

export type ContactRequest = {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  vehicleType?: string;
  message: string;
};

export type ContactResponse = {
  inquiry: InquiryWithContext;
};

export type UpdateInquiryRequest = {
  status: InquiryStatus;
};

export type UpdateInquiryResponse = {
  inquiry: InquiryWithContext;
};

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  const data = (await response.json()) as Record<string, unknown>;

  if (!response.ok) {
    const errorMessage =
      (data.error as string) || `API error: ${response.status}`;
    throw new ApiClientError(errorMessage, response.status);
  }

  return data as T;
}

// API client functions
export const apiClient = {
  // Auth endpoints
  async login(request: LoginRequest): Promise<AuthResponse> {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    return handleResponse<AuthResponse>(response);
  },

  async register(request: RegisterRequest): Promise<AuthResponse> {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    return handleResponse<AuthResponse>(response);
  },

  async logout(): Promise<void> {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    });

    if (!response.ok) {
      const data = (await response.json()) as Record<string, unknown>;
      throw new ApiClientError(
        (data.error as string) || "Failed to logout",
        response.status,
      );
    }
  },

  async forgotPassword(
    request: ForgotPasswordRequest,
  ): Promise<ForgotPasswordResponse> {
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    return handleResponse<ForgotPasswordResponse>(response);
  },

  async resetPassword(request: ResetPasswordRequest): Promise<void> {
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const data = (await response.json()) as Record<string, unknown>;
      throw new ApiClientError(
        (data.error as string) || "Failed to reset password",
        response.status,
      );
    }
  },

  // Booking endpoints
  async createBooking(request: BookingRequest): Promise<BookingResponse> {
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    return handleResponse<BookingResponse>(response);
  },

  // Contact endpoints
  async createInquiry(request: ContactRequest): Promise<ContactResponse> {
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    return handleResponse<ContactResponse>(response);
  },

  // Inquiry endpoints
  async updateInquiry(
    inquiryId: string,
    request: UpdateInquiryRequest,
  ): Promise<UpdateInquiryResponse> {
    const response = await fetch(`/api/inquiries/${inquiryId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });

    return handleResponse<UpdateInquiryResponse>(response);
  },
};
