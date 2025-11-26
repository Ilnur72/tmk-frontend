import axios from "axios";
import { API_URL } from "../config/const";
import {
  Application,
  CreateApplicationDto,
  UpdateApplicationDto,
} from "../types/application";

// Real applications API endpoint
const APPLICATIONS_API_URL = `${API_URL}/applications`;

// JWT token olish
const getAuthToken = () => {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
};

// Headers bilan request yaratish
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };
};

// CRUD операции - real applications API
export const getAllApplications = async (): Promise<Application[]> => {
  try {
    const response = await axios.get(
      `${APPLICATIONS_API_URL}`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching applications:", error);
    throw error;
  }
};

// Admin uchun barcha arizalarni olish
export const getAllApplicationsForAdmin = async (): Promise<Application[]> => {
  try {
    const response = await axios.get(
      `${APPLICATIONS_API_URL}/admin/all`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching all applications for admin:", error);
    throw error;
  }
};

export const getApplicationById = async (id: string): Promise<Application> => {
  try {
    const response = await axios.get(
      `${APPLICATIONS_API_URL}/${id}`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching application:", error);
    throw error;
  }
};

export const createApplication = async (
  data: CreateApplicationDto
): Promise<Application> => {
  const response = await axios.post(
    `${APPLICATIONS_API_URL}`,
    data,
    getAuthHeaders()
  );
  return response.data;
};

export const updateApplication = async (
  id: string,
  data: UpdateApplicationDto
): Promise<Application> => {
  const response = await axios.patch(
    `${APPLICATIONS_API_URL}/${id}`,
    data,
    getAuthHeaders()
  );
  return response.data;
};

export const deleteApplication = async (id: string): Promise<void> => {
  await axios.delete(`${APPLICATIONS_API_URL}/${id}`, getAuthHeaders());
};

// Status bo'yicha filterlash
export const getApplicationsByStatus = async (
  status: string
): Promise<Application[]> => {
  const response = await axios.get(
    `${APPLICATIONS_API_URL}?status=${status}`,
    getAuthHeaders()
  );
  return response.data;
};

// Region bo'yicha filterlash
export const getApplicationsByRegion = async (
  region: string
): Promise<Application[]> => {
  const response = await axios.get(
    `${APPLICATIONS_API_URL}?region=${region}`,
    getAuthHeaders()
  );
  return response.data;
};

// Mening arizalarim - /my endpoint
export const getMyApplications = async (): Promise<Application[]> => {
  try {
    const response = await axios.get(
      `${APPLICATIONS_API_URL}/my`,
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching my applications:", error);
    throw error;
  }
};

// Application status yangilash
export const updateApplicationStatus = async (
  id: string,
  status: "pending" | "approved" | "rejected" | "in-review"
): Promise<Application> => {
  try {
    const response = await axios.patch(
      `${APPLICATIONS_API_URL}/${id}/status`,
      { status },
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error updating application status:", error);
    throw error;
  }
};

// Admin comment qo'shish
export const updateApplicationComment = async (
  id: string,
  adminComment: string
): Promise<Application> => {
  try {
    const response = await axios.patch(
      `${APPLICATIONS_API_URL}/${id}`,
      { adminComment },
      getAuthHeaders()
    );
    return response.data;
  } catch (error) {
    console.error("Error updating application comment:", error);
    throw error;
  }
};

// Rasmlar yuklash
export const uploadImage = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await axios.post(`${API_URL}/upload/image`, formData, {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.url;
};

// Bir nechta rasm yuklash
export const uploadMultipleImages = async (
  files: File[]
): Promise<string[]> => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("images", file);
  });

  const response = await axios.post(`${API_URL}/upload/images`, formData, {
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data.urls;
};

const applicationsService = {
  getAllApplications,
  getMyApplications,
  getApplicationById,
  createApplication,
  updateApplication,
  updateApplicationStatus,
  deleteApplication,
  getApplicationsByStatus,
  getApplicationsByRegion,
  uploadImage,
  uploadMultipleImages,
};

export default applicationsService;
