import "server-only";

import { getBackendApiUrl } from "@/lib/env";
import type {
  BookingWithCar,
  DashboardPayload,
  InquiryWithContext,
  InquiryStatus,
  PublicUser,
} from "@/lib/types";

type LoginInput = {
  email: string;
  password: string;
};

type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

type CreateBookingInput = {
  carId: string;
  startDate: string;
  endDate: string;
  offerCode?: string;
};

type CreateContactInquiryInput = {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  vehicleType?: string;
  message: string;
};

type AuthSuccessPayload = {
  user: PublicUser;
  sessionToken: string;
};

type AuthUserPayload = {
  user: PublicUser;
};

type ErrorPayload = {
  error?: string;
};

type DashboardPayloadWithUser = DashboardPayload;

type ContactPayload = {
  inquiry: InquiryWithContext;
};

export class BackendServiceError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
  ) {
    super(message);
    this.name = "BackendServiceError";
  }
}

export { BackendServiceError as AuthServiceError };

async function parseErrorMessage(response: Response) {
  try {
    const payload = (await response.json()) as ErrorPayload;
    return payload.error ?? "Backend service request failed.";
  } catch {
    return "Backend service request failed.";
  }
}

type BackendRequestOptions = RequestInit & {
  sessionToken?: string;
};

async function backendRequest<T>(path: string, init: BackendRequestOptions = {}) {
  const headers = new Headers(init.headers);

  if (init.sessionToken) {
    headers.set("Authorization", `Bearer ${init.sessionToken}`);
  }

  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  let response: Response;

  try {
    response = await fetch(`${getBackendApiUrl()}${path}`, {
      cache: "no-store",
      ...init,
      headers,
    });
  } catch {
    throw new BackendServiceError(
      "The backend service is unavailable right now.",
      503,
    );
  }

  if (!response.ok) {
    throw new BackendServiceError(
      await parseErrorMessage(response),
      response.status,
    );
  }

  return (await response.json()) as T;
}

export async function loginWithAuthService(input: LoginInput) {
  return backendRequest<AuthSuccessPayload>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function registerWithAuthService(input: RegisterInput) {
  return backendRequest<AuthSuccessPayload>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function logoutWithAuthService(sessionToken?: string) {
  if (!sessionToken) {
    return;
  }

  try {
    await backendRequest<{ ok: true }>("/auth/logout", {
      method: "POST",
      sessionToken,
    });
  } catch (error) {
    if (
      error instanceof BackendServiceError &&
      error.statusCode === 401
    ) {
      return;
    }

    throw error;
  }
}

export async function getAuthUserBySessionToken(sessionToken?: string) {
  if (!sessionToken) {
    return null;
  }

  try {
    const payload = await backendRequest<AuthUserPayload>("/auth/me", {
      sessionToken,
    });

    return payload.user;
  } catch (error) {
    if (
      error instanceof BackendServiceError &&
      error.statusCode === 401
    ) {
      return null;
    }

    throw error;
  }
}

export async function getDashboardWithAuthService(sessionToken?: string) {
  if (!sessionToken) {
    return null;
  }

  return backendRequest<DashboardPayloadWithUser>("/dashboard/me", {
    sessionToken,
  });
}

export async function getBookingsWithAuthService(sessionToken?: string) {
  if (!sessionToken) {
    return null;
  }

  return backendRequest<{ bookings: BookingWithCar[] }>("/bookings/me", {
    sessionToken,
  });
}

export async function createBookingWithAuthService(
  sessionToken: string | undefined,
  input: CreateBookingInput,
) {
  return backendRequest<{ booking: BookingWithCar }>("/bookings", {
    method: "POST",
    sessionToken,
    body: JSON.stringify(input),
  });
}

export async function createContactInquiryWithAuthService(
  sessionToken: string | undefined,
  input: CreateContactInquiryInput,
) {
  return backendRequest<ContactPayload>("/contact", {
    method: "POST",
    sessionToken,
    body: JSON.stringify(input),
  });
}

export async function updateInquiryStatusWithAuthService(
  sessionToken: string | undefined,
  inquiryId: string,
  status: InquiryStatus,
) {
  return backendRequest<{ inquiry: InquiryWithContext }>(
    `/inquiries/${inquiryId}`,
    {
      method: "PATCH",
      sessionToken,
      body: JSON.stringify({ status }),
    },
  );
}
