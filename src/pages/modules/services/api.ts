import axios from "axios";
import { API_URL } from "../../../config/const";

// API base configuration - modules uchun
const API_BASE_URL = API_URL; // Backend server manzili

// Modules API instance - o'z token management bilan
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Session cookie uchun
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - modules uchun alohida token management
api.interceptors.request.use(
  (config) => {
    // Modules uchun alohida token key
    const token =
      localStorage.getItem("modules_auth_token") ||
      localStorage.getItem("modules_access_token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    //
    return Promise.reject(error);
  }
);

// Response interceptor - javoblarni debug qilish uchun
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 401 Unauthorized xatoligi bo'lsa
    if (error.response?.status === 401) {
      // localStorage ni tozalash
      localStorage.removeItem("auth_token");
      localStorage.removeItem("access_token");
      localStorage.removeItem("partner_data");
      localStorage.removeItem("user_data");
      localStorage.removeItem("partner_id");

      // Auth sahifasiga redirect
      window.location.href = `/partner-portal/auth`;
    }

    return Promise.reject(error);
  }
);

// Types
export interface Partner {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  avatar?: string;
  status: "active" | "inactive" | "pending";
  phone?: string;
  company?: string;
  description?: string;
  documents?: File[];
  region?: string;
  location?: string;
  coordinates?: { lat: number; lng: number };
  createdAt: string;
}

// Partners Auth API
export const authAPI = {
  // Login
  login: async (credentials: { email: string; password: string }) => {
    const response = await api.post("/partners/auth/login", credentials);
    return response.data;
  },

  // Register
  register: async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) => {
    const response = await api.post("/partners/auth/register", userData);
    return response.data;
  },

  // Google OAuth redirect
  googleAuth: () => {
    window.location.href = `${API_BASE_URL}/partners/auth/google`;
  },

  // Get current user profile
  getProfile: async (): Promise<Partner> => {
    const response = await api.get("/partners/auth/profile");
    return response.data;
  },

  // Update partner profile
  updatePartnerProfile: async (
    partnerData: Partial<Partner>
  ): Promise<Partner> => {
    const response = await api.put("/partners/auth/profile", partnerData);
    return response.data;
  },

  // Logout
  logout: async (): Promise<void> => {
    await api.post("/partners/auth/logout");
  },
};

// Application API
export const applicationAPI = {
  // Submit new application
  submitApplication: async (applicationData: {
    title: string;
    tagline?: string;
    description: string;
    coverImage?: File;
    galleryImages?: File[];
    contactEmail: string;
    phoneNumber: string;
    categories: string[];
    region: string;
    location: string;
    coordinates?: { lat: number; lng: number };
  }) => {
    // Validation
    if (!applicationData.title || applicationData.title.trim() === "") {
      throw new Error("Title is required");
    }

    if (
      !applicationData.description ||
      applicationData.description.trim() === ""
    ) {
      throw new Error("Description is required");
    }

    // FormData yaratish (file upload uchun)
    const formData = new FormData();

    // Text ma'lumotlarni qo'shish (trim qilib)
    formData.append("title", applicationData.title.trim());
    if (applicationData.tagline && applicationData.tagline.trim()) {
      formData.append("tagline", applicationData.tagline.trim());
    }
    formData.append("description", applicationData.description.trim());
    formData.append("contactEmail", applicationData.contactEmail);
    formData.append("phoneNumber", applicationData.phoneNumber);
    formData.append("categories", JSON.stringify(applicationData.categories));
    formData.append("region", applicationData.region);
    formData.append("location", applicationData.location);

    if (applicationData.coordinates) {
      formData.append(
        "coordinates",
        JSON.stringify(applicationData.coordinates)
      );
    }

    // Cover image qo'shish
    if (applicationData.coverImage) {
      formData.append("coverImage", applicationData.coverImage);
    }

    // Gallery images qo'shish
    if (
      applicationData.galleryImages &&
      applicationData.galleryImages.length > 0
    ) {
      applicationData.galleryImages.forEach((file, index) => {
        formData.append(`galleryImages`, file);
      });
    }

    const response = await api.post("/partners/applications", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // JSON version (agar backend FormData qabul qilmasa)
  submitApplicationJSON: async (applicationData: {
    title: string;
    tagline?: string;
    description: string;
    contactEmail: string;
    phoneNumber: string;
    categories?: string[];
    region: string;
    location: string;
    coordinates?: { lat: number; lng: number };
  }) => {
    const response = await api.post("/partners/applications", {
      title: applicationData.title.trim(),
      tagline: applicationData.tagline?.trim() || null,
      description: applicationData.description.trim(),
      contactEmail: applicationData.contactEmail.trim(),
      phoneNumber: applicationData.phoneNumber.trim(),
      // categories: applicationData.categories, // Backend bu fieldni qabul qilmaydi
      region: applicationData.region,
      location: applicationData.location.trim(),
      coordinates: applicationData.coordinates || null,
    });
    return response.data;
  },

  // Get user's applications
  getApplications: async () => {
    const response = await api.get("/partners/applications");
    return response.data;
  },

  // Get single application
  getApplication: async (id: string) => {
    const response = await api.get(`/partners/applications/${id}`);
    return response.data;
  },

  // Update application
  updateApplication: async (id: string, applicationData: any) => {
    const response = await api.put(
      `/partners/applications/${id}`,
      applicationData
    );
    return response.data;
  },

  // Delete application
  deleteApplication: async (id: string) => {
    const response = await api.delete(`/partners/applications/${id}`);
    return response.data;
  },
};

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      window.location.href = `/partner-portal/auth`;
    }
    return Promise.reject(error);
  }
);

export default api;
