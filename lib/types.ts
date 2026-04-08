export type CarType =
  | "SUV"
  | "Luxury"
  | "Electric"
  | "Sedan"
  | "Compact"
  | "Van";

export type Transmission = "Automatic" | "Manual";

export type FuelType = "Electric" | "Hybrid" | "Petrol" | "Diesel";

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
  createdAt: string;
};

export type BookingWithCar = Booking & {
  car: Car;
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
  name: string;
  email: string;
  phone?: string;
  location?: string;
  vehicleType?: CarType;
  message: string;
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
  passwordHash: string;
  createdAt: string;
};

export type PublicUser = Omit<UserRecord, "passwordHash">;

export type SessionRecord = {
  token: string;
  userId: string;
  createdAt: string;
};

export type CarFilters = {
  query?: string;
  location?: string;
  type?: CarType;
  maxPrice?: number;
  featuredOnly?: boolean;
};
