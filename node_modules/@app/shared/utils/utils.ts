import type { ApiResponse } from "../types/index.js";



export function createApiResponse<T>(success: boolean,
    data?: T, message?: string,
    error?: string, code?: string): ApiResponse<T> {
    return {
        success,
        data,
        message,
        error,
        code
    } as ApiResponse
}


