/**
 * API Client
 *
 * Core API client implementation with HTTP methods and request handling.
 */

import axios, { type AxiosError } from "axios"
import { getApiBaseUrl } from "./config"

const axiosInstance = axios.create({
	baseURL: getApiBaseUrl(),
	headers: { "Content-Type": "application/json" },
})

// Basic error handler to wrap errors in a consistent way
axiosInstance.interceptors.response.use(
	(response) => response,
	(error: AxiosError) => {
		// You can customize this as needed
		return Promise.reject(new Error(error.message))
	}
)

export const apiClient = {
	health: {
		get: () => axiosInstance.get("/health"),
	},
	auth: {
		login: (data: { email: string; password: string }) => axiosInstance.post("/auth/login", data),
	},
	// Add more endpoint groups here as needed
}
