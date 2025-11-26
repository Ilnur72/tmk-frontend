export interface Application {
  id: string;
  title: string;
  description: string;
  location: string;
  phoneNumber: string;
  contactEmail: string;
  region: string;
  tagline?: string;
  coverImage?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  galleryImages?: string[];
  status: "pending" | "approved" | "rejected" | "in-review";
  adminComment?: string;
  partnerId: string;
  partner?: {
    id: string;
    companyName: string;
    contactPerson: string;
    email: string;
    phoneNumber: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateApplicationDto {
  title: string;
  description: string;
  location: string;
  phoneNumber: string;
  contactEmail: string;
  region: string;
  tagline?: string;
  coverImage?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  galleryImages?: string[];
}

export interface UpdateApplicationDto {
  title?: string;
  description?: string;
  location?: string;
  phoneNumber?: string;
  contactEmail?: string;
  region?: string;
  tagline?: string;
  coverImage?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
  galleryImages?: string[];
  status?: "pending" | "approved" | "rejected" | "in-review";
}

export type ApplicationStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "in-review";

export interface ApplicationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  inReview: number;
}
