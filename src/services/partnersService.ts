import axios from "axios";
import { API_URL } from "../config/const";
import {
  Partner,
  CreatePartnerDto,
  UpdatePartnerDto,
  RegisterPartnerDto,
  LoginPartnerDto,
  PartnerAuthResponse,
  PartnerTokenVerification,
} from "../types/partner";

const PARTNERS_API_URL = `${API_URL}/partners`;

// CRUD операции
export const getAllPartners = async (): Promise<Partner[]> => {
  const response = await axios.get(`${PARTNERS_API_URL}`);
  return response.data;
};

export const getActivePartners = async (): Promise<Partner[]> => {
  const response = await axios.get(`${PARTNERS_API_URL}/active`);
  return response.data;
};

export const getPendingPartners = async (): Promise<Partner[]> => {
  const response = await axios.get(`${PARTNERS_API_URL}/pending`);
  return response.data;
};

export const getPartnerById = async (id: string): Promise<Partner> => {
  const response = await axios.get(`${PARTNERS_API_URL}/${id}`);
  return response.data;
};

export const createPartner = async (
  data: CreatePartnerDto
): Promise<Partner> => {
  const response = await axios.post(`${PARTNERS_API_URL}`, data);
  return response.data;
};

export const updatePartner = async (
  id: string,
  data: UpdatePartnerDto
): Promise<Partner> => {
  const response = await axios.patch(`${PARTNERS_API_URL}/${id}`, data);
  return response.data;
};

export const deletePartner = async (id: string): Promise<void> => {
  await axios.delete(`${PARTNERS_API_URL}/${id}`);
};

// Статус операции
export const activatePartner = async (id: string): Promise<Partner> => {
  const response = await axios.patch(`${PARTNERS_API_URL}/${id}/activate`);
  return response.data;
};

export const deactivatePartner = async (id: string): Promise<Partner> => {
  const response = await axios.patch(`${PARTNERS_API_URL}/${id}/deactivate`);
  return response.data;
};

// Аутентификация
export const registerPartner = async (
  data: RegisterPartnerDto
): Promise<PartnerAuthResponse> => {
  const response = await axios.post(`${PARTNERS_API_URL}/register`, data);
  return response.data;
};

export const loginPartner = async (
  data: LoginPartnerDto
): Promise<PartnerAuthResponse> => {
  const response = await axios.post(`${PARTNERS_API_URL}/login`, data);
  return response.data;
};

export const verifyToken = async (
  token: string
): Promise<PartnerTokenVerification> => {
  const response = await axios.post(`${PARTNERS_API_URL}/verify-token`, {
    token,
  });
  return response.data;
};

export const getProfile = async (): Promise<Partner> => {
  const token = localStorage.getItem("partner_token");
  const response = await axios.get(`${PARTNERS_API_URL}/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const updateProfile = async (
  data: UpdatePartnerDto
): Promise<Partner> => {
  const token = localStorage.getItem("partner_token");
  const response = await axios.patch(`${PARTNERS_API_URL}/profile`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const resetPassword = async (
  email: string
): Promise<{ message: string }> => {
  const response = await axios.post(`${PARTNERS_API_URL}/reset-password`, {
    email,
  });
  return response.data;
};

export const changePassword = async (
  oldPassword: string,
  newPassword: string
): Promise<{ message: string }> => {
  const token = localStorage.getItem("partner_token");
  const response = await axios.post(
    `${PARTNERS_API_URL}/change-password`,
    {
      oldPassword,
      newPassword,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

const partnersService = {
  getAllPartners,
  getActivePartners,
  getPendingPartners,
  getPartnerById,
  createPartner,
  updatePartner,
  deletePartner,
  activatePartner,
  deactivatePartner,
  registerPartner,
  loginPartner,
  verifyToken,
  getProfile,
  updateProfile,
  resetPassword,
  changePassword,
};

export default partnersService;
