import api from "./api";
import { User, ApiResponse } from "../types";

interface AuthData {
  token: string;
  user: User;
}

// Register user
export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
  role?: string;
}): Promise<AuthData> => {
  const { data: res } = await api.post<ApiResponse<AuthData>>("/auth/register", data);
  return res.data!;
};

// Login user
export const loginUser = async (data: {
  email: string;
  password: string;
}): Promise<AuthData> => {
  const { data: res } = await api.post<ApiResponse<AuthData>>("/auth/login", data);
  return res.data!;
};

// Get currently logged in user info
export const getMe = async (): Promise<User> => {
  const { data } = await api.get<ApiResponse<User>>("/auth/me");
  return data.data!;
};
