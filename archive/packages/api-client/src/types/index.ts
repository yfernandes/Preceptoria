/**
 * Shared TypeScript interfaces and types
 *
 * This module contains shared TypeScript interfaces and types used throughout the API client.
 */

import type { ApiError } from "../errors"

export interface RequestState<T> {
	data: T | null
	isLoading: boolean
	isError: boolean
	error: ApiError | null
	isSuccess: boolean
}

export function createRequestState<T>(): RequestState<T> {
	return {
		data: null,
		isLoading: false,
		isError: false,
		error: null,
		isSuccess: false,
	}
}

export function setLoading<T>(state: RequestState<T>): RequestState<T> {
	return {
		...state,
		isLoading: true,
		isError: false,
		error: null,
		isSuccess: false,
	}
}

export function setSuccess<T>(state: RequestState<T>, data: T): RequestState<T> {
	return {
		...state,
		isLoading: false,
		isError: false,
		error: null,
		isSuccess: true,
		data,
	}
}

export function setError<T>(state: RequestState<T>, error: ApiError): RequestState<T> {
	return { ...state, isLoading: false, isError: true, error, isSuccess: false }
}
