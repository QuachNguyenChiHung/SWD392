// Base API configuration
import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class ApiService {
    private axiosInstance: AxiosInstance;

    constructor(baseUrl: string) {
        this.axiosInstance = axios.create({
            baseURL: baseUrl,
            withCredentials: true, // Include cookies for session management
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Request interceptor to add auth token
        this.axiosInstance.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                console.log(`API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
                return config;
            },
            (error) => {
                console.error('Request interceptor error:', error);
                return Promise.reject(error);
            }
        );

        // Response interceptor for error handling
        this.axiosInstance.interceptors.response.use(
            (response) => {
                console.log('API Response:', response.data);
                return response;
            },
            (error: AxiosError) => {
                console.error('API request error:', error.response?.data || error.message);
                const errorData = error.response?.data as any;
                const message = errorData?.message || error.message || 'Request failed';
                
                // Create a proper error object with the message
                const apiError = new Error(message);
                (apiError as any).status = error.response?.status;
                (apiError as any).data = errorData;
                
                return Promise.reject(apiError);
            }
        );
    }

    // HTTP methods
    async get(endpoint: string, config?: AxiosRequestConfig) {
        const response = await this.axiosInstance.get(endpoint, config);
        return response.data;
    }

    async post(endpoint: string, body?: any, config?: AxiosRequestConfig) {
        const response = await this.axiosInstance.post(endpoint, body, config);
        return response.data;
    }

    async put(endpoint: string, body?: any, config?: AxiosRequestConfig) {
        const response = await this.axiosInstance.put(endpoint, body, config);
        return response.data;
    }

    async patch(endpoint: string, body?: any, config?: AxiosRequestConfig) {
        const response = await this.axiosInstance.patch(endpoint, body, config);
        return response.data;
    }

    async delete(endpoint: string, config?: AxiosRequestConfig) {
        const response = await this.axiosInstance.delete(endpoint, config);
        return response.data;
    }

    // Helper method for file uploads with FormData
    async uploadFile(endpoint: string, formData: FormData, config?: AxiosRequestConfig) {
        const response = await this.axiosInstance.post(endpoint, formData, {
            ...config,
            headers: {
                'Content-Type': 'multipart/form-data',
                ...config?.headers,
            },
        });
        return response.data;
    }

    // Helper method for file updates with FormData (PUT request)
    async updateFileUpload(endpoint: string, formData: FormData, config?: AxiosRequestConfig) {
        const response = await this.axiosInstance.put(endpoint, formData, {
            ...config,
            headers: {
                'Content-Type': 'multipart/form-data',
                ...config?.headers,
            },
        });
        return response.data;
    }

    // Get the axios instance for advanced usage
    getAxiosInstance(): AxiosInstance {
        return this.axiosInstance;
    }
}

export const apiService = new ApiService(API_BASE_URL);