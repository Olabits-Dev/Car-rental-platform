export type CarType =
  | "SUV"
  | "Luxury"
  | "Electric"
  | "Sedan"
  | "Compact"
  | "Van";

export type Transmission = "Automatic" | "Manual";

export type FuelType = "Electric" | "Hybrid" | "Petrol" | "Diesel";

export type UserRole = "owner" | "agent" | "member";

export type InquiryStatus = "new" | "in_progress" | "resolved";

export type BookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export type PaymentStatus = "pending" | "success" | "failed" | "abandoned";

export type CarGalleryImage = {
  src: string;
  alt: string;
  label: string;
};

export type DealOffer = {
  code: string;
  title: string;
  tag: string;
  description: string;
  savingsPercent: number;
  savingsPerDay: number;
  salePricePerDay: number;
  benefits: string[];
  car: Car;
};

export type Car = {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  type: CarType;
  location: string;
  pricePerDay: number;
  rating: number;
  trips: number;
  seats: number;
  transmission: Transmission;
  fuel: FuelType;
  range: string;
  featured: boolean;
  summary: string;
  description: string;
  features: string[];
  heroImage: string;
  gallery: CarGalleryImage[];
  imageAlt: string;
  palette: {
    from: string;
    to: string;
    accent: string;
  };
};

export type Booking = {
  id: string;
  userId: string;
  carId: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  offerCode?: string;
  status: BookingStatus;
  assignedAgentId?: string | null;
  createdAt: string;
};

export type Payment = {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  reference?: string;
  createdAt: string;
};

export type CarSummary = Pick<
  Car,
  | "id"
  | "name"
  | "brand"
  | "model"
  | "location"
  | "type"
  | "pricePerDay"
  | "seats"
  | "transmission"
  | "fuel"
  | "summary"
>;

export type BookingWithCar = Booking & {
  car: CarSummary;
  user?: PublicUser | null;
  assignedAgent?: PublicUser | null;
  payment?: Payment | null;
};

export type CreateBookingInput = {
  userId: string;
  carId: string;
  startDate: string;
  endDate: string;
  offerCode?: string;
};

export type ContactInquiry = {
  id: string;
  userId?: string | null;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  vehicleType?: CarType;
  message: string;
  status: InquiryStatus;
  assignedAgentId?: string | null;
  createdAt: string;
};

export type CreateContactInquiryInput = {
  name: string;
  email: string;
  phone?: string;
  location?: string;
  vehicleType?: CarType;
  message: string;
};

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  passwordHash: string;
  createdAt: string;
};

export type PublicUser = Omit<UserRecord, "passwordHash">;

export type SessionRecord = {
  token: string;
  userId: string;
  createdAt: string;
};

export type InquiryWithContext = ContactInquiry & {
  user?: PublicUser | null;
  assignedAgent?: PublicUser | null;
};

export type MemberDashboardData = {
  role: "member";
  user: PublicUser;
  stats: {
    totalTrips: number;
    upcomingTrips: number;
    totalSpend: number;
    activeRequests: number;
  };
  bookings: BookingWithCar[];
  inquiries: InquiryWithContext[];
};

export type AgentDashboardData = {
  role: "agent";
  user: PublicUser;
  stats: {
    openInquiries: number;
    inProgressInquiries: number;
    todayPickups: number;
    upcomingBookings: number;
  };
  inquiryQueue: InquiryWithContext[];
  assignedBookings: BookingWithCar[];
  recentMembers: PublicUser[];
};

export type OwnerDashboardData = {
  role: "owner";
  user: PublicUser;
  stats: {
    totalMembers: number;
    totalAgents: number;
    openInquiries: number;
    monthlyRevenue: number;
    upcomingBookings: number;
  };
  recentBookings: BookingWithCar[];
  inquiryQueue: InquiryWithContext[];
  teamMembers: PublicUser[];
  locationPerformance: Array<{
    location: string;
    bookings: number;
    revenue: number;
  }>;
};

export type DashboardPayload =
  | MemberDashboardData
  | AgentDashboardData
  | OwnerDashboardData;

export type CarFilters = {
  query?: string;
  location?: string;
  type?: CarType;
  maxPrice?: number;
  featuredOnly?: boolean;
};
