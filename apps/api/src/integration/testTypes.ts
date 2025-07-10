// Type definitions for API responses
export interface HealthResponse {
	status: string;
	timestamp: string;
	uptime: number;
	environment: string;
}

export interface LoginResponse {
	success: boolean;
	message: string;
	user: {
		id: string;
		name: string;
		email: string;
		phone: string;
		roles: string[];
		createdAt: string;
		updatedAt: string;
	};
}

export interface ErrorResponse {
	success: boolean;
	message: string;
	error?: string;
}

export interface ClassesResponse {
	success: boolean;
	data: unknown[];
}
