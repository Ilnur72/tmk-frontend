export interface Partner {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  description?: string;
  website?: string;
  status: "pending" | "active" | "inactive";
  googleId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePartnerDto {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  description?: string;
  website?: string;
}

export interface UpdatePartnerDto {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  description?: string;
  website?: string;
  status?: "pending" | "active" | "inactive";
}

export interface RegisterPartnerDto {
  name: string;
  email: string;
  password: string;
  phone?: string;
  company?: string;
  position?: string;
  description?: string;
  website?: string;
}

export interface LoginPartnerDto {
  email: string;
  password: string;
}

export interface PartnerAuthResponse {
  success: boolean;
  message: string;
  partner?: {
    id: string;
    name: string;
    email: string;
    status: string;
  };
  token?: string;
}

export interface PartnerTokenVerification {
  valid: boolean;
  message?: string;
  partner?: {
    id: string;
    name: string;
    email: string;
    status: string;
  };
}
