import api from "./api";

interface Application {
  id?: string;
  title: string;
  description: string;
  location: string;
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
  status?: "pending" | "approved" | "rejected";
  partnerId?: string;
  partner?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface CreateApplicationData {
  title: string;
  description: string;
  location: string;
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
}

interface UpdateApplicationData {
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
}

export const applicationsAPI = {
  // Ariza yaratish
  create: async (data: CreateApplicationData): Promise<Application> => {
    const response = await api.post("/applications", data);
    return response.data;
  },

  // O'z arizalarimni ko'rish
  getMyApplications: async (): Promise<Application[]> => {
    const response = await api.get("/applications/my");
    console.log(response.data);
    
    return response.data;
  },

  // Bitta arizani ko'rish
  getById: async (id: string): Promise<Application> => {
    const response = await api.get(`/applications/${id}`);
    return response.data;
  },

  // Arizani tahrirlash
  update: async (
    id: string,
    data: UpdateApplicationData
  ): Promise<Application> => {
    const response = await api.patch(`/applications/${id}`, data);
    return response.data;
  },

  // Arizani o'chirish
  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/applications/${id}`);
    return response.data;
  },

  // Ariza rasmlarini yuklash
  uploadImages: async (
    id: string,
    files: File[]
  ): Promise<{
    success: boolean;
    message: string;
    images: { fileName: string; url: string }[];
  }> => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("images", file);
    });

    const response = await api.post(`/applications/${id}/images`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // Cover image yuklash
  uploadCoverImage: async (
    id: string,
    file: File
  ): Promise<{
    success: boolean;
    message: string;
    fileName: string;
    url: string;
  }> => {
    const formData = new FormData();
    formData.append("coverImage", file);

    const response = await api.post(
      `/applications/${id}/cover-image`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // Rasmni o'chirish
  deleteImage: async (
    id: string,
    filename: string
  ): Promise<{
    success: boolean;
    message: string;
  }> => {
    const response = await api.delete(`/applications/${id}/images/${filename}`);
    return response.data;
  },
};

export default applicationsAPI;
export type { Application, CreateApplicationData, UpdateApplicationData };
