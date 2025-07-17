import { describe, it, expect } from "bun:test";
import { createRequestState, setLoading, setSuccess, setError } from "../types";

describe("Request state utilities", () => {
	it("should create initial state", () => {
		const state = createRequestState<number>();
		expect(state).toEqual({
			data: null,
			isLoading: false,
			isError: false,
			error: null,
			isSuccess: false,
		});
	});

	it("should set loading state", () => {
		const state = setLoading(createRequestState());
		expect(state.isLoading).toBe(true);
		expect(state.isError).toBe(false);
	});

	it("should set success state", () => {
		let state = createRequestState<number>();
		state = setSuccess(state, 42);
		expect(state.isSuccess).toBe(true);
		expect(state.data).toBe(42);
	});

	it("should set error state", () => {
		let state = createRequestState<number>();
		const err = { message: "fail" };
		state = setError(state, err as any);
		expect(state.isError).toBe(true);
		expect(state.error).toBe(err);
	});
});
