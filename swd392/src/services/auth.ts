import { apiService } from './api';
import type { User } from '../types';

// Types for API requests/responses
export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    username: string; // Backend expects username, not name
    email: string;
    password: string;
}

export interface AuthResponse {
    success?: boolean;
    user?: any;
    token?: string;
    message?: string;
}

export interface ApiError {
    success: false;
    message: string;
}

class AuthService {
    async login(credentials: LoginRequest): Promise<AuthResponse> {
        try {
            console.log('🔍 Starting login with email:', credentials.email);
            // Backend expects email and password, and sets signed cookie automatically
            const loginResponse = await apiService.post('/login', credentials);
            console.log('🔍 Login response:', JSON.stringify(loginResponse, null, 2));

            if (!loginResponse?.token) {
                console.error('❌ No token in login response:', loginResponse);
                throw new Error('Login failed - no token received');
            }

            console.log('✅ Token received, storing in localStorage');
            // Store token in localStorage as backup (backend uses signed cookies as primary)
            localStorage.setItem('token', loginResponse.token);

            console.log('🔍 Fetching current user...');
            // Get user data from /me endpoint
            const userResponse = await this.getCurrentUser();
            console.log('✅ User fetched:', userResponse);

            return {
                success: true,
                user: userResponse,
                token: loginResponse.token
            };
        } catch (error: any) {
            console.error('❌ Login API error:', error);
            // Extract proper error message
            const errorMessage = error?.message || 'Login failed';
            throw new Error(errorMessage);
        }
    }

    async googleLogin(credential: string): Promise<AuthResponse> {
        try {
            console.log('🔍 Starting Google login with credential:', credential?.substring(0, 20) + '...');
            const loginResponse = await apiService.post('/google-login', { credential });
            console.log('🔍 Google login response:', JSON.stringify(loginResponse, null, 2));

            if (!loginResponse?.token) {
                console.error('❌ No token in Google login response:', loginResponse);
                throw new Error('Google login failed - no token received');
            }

            console.log('✅ Token received, storing in localStorage');
            localStorage.setItem('token', loginResponse.token);

            console.log('🔍 Fetching current user...');
            const userResponse = await this.getCurrentUser();
            console.log('✅ User fetched:', userResponse);

            return {
                success: true,
                user: userResponse,
                token: loginResponse.token
            };
        } catch (error: any) {
            console.error('❌ Google login API error:', error);
            const errorMessage = error?.message || 'Google login failed';
            throw new Error(errorMessage);
        }
    }

    async register(userData: RegisterRequest): Promise<AuthResponse> {
        try {
            const response = await apiService.post('/register', userData);

            // Backend only returns the new user data on registration, not a token
            // We need to login after registration to get a token
            if (response._id || response.id) {
                // Registration successful, now login to get token
                const loginResult = await this.login({
                    email: userData.email,
                    password: userData.password
                });

                return loginResult;
            }

            throw new Error('Registration failed - no user data received');
        } catch (error: any) {
            console.error('Register API error:', error);
            const errorMessage = error?.message || 'Registration failed';
            throw new Error(errorMessage);
        }
    }

    async logout(): Promise<void> {
        try {
            // Call logout endpoint to clear signed cookie on backend
            await apiService.post('/removeToken', {});
        } catch (error) {
            console.error('Logout API call failed:', error);
            // Continue with local cleanup even if API call fails
        } finally {
            // Always clear local storage
            this.clearLocalAuth();
        }
    }

    async getCurrentUser(): Promise<User> {
        try {
            console.log('🔍 [getCurrentUser] Calling /me endpoint...');
            console.log('🔍 [getCurrentUser] Token in localStorage:', localStorage.getItem('token')?.substring(0, 30) + '...');
            
            const response = await apiService.get('/me');
            console.log('🔍 [getCurrentUser] Response received:', JSON.stringify(response, null, 2));

            // Backend returns { user: userData }
            const user = response.user || response;

            if (user) {
                // Transform backend user format to frontend format if needed
                const transformedUser: User = {
                    id: user.id || user._id || user.id_,
                    email: user.email,
                    name: user.username || user.name, // Backend uses username, frontend expects name
                    role: user.role
                };

                console.log('✅ [getCurrentUser] User transformed:', transformedUser);
                localStorage.setItem('user', JSON.stringify(transformedUser));
                return transformedUser;
            }

            throw new Error('No user data received');
        } catch (error) {
            console.error('❌ [getCurrentUser] Error:', error);
            // Clear invalid tokens
            this.clearLocalAuth();
            throw error;
        }
    }

    async updateProfile(userData: Partial<User>): Promise<User> {
        try {
            const response = await apiService.patch('/me', userData);

            // Update stored user data
            const user = response.user || response;
            localStorage.setItem('user', JSON.stringify(user));

            return user;
        } catch (error) {
            console.error('Update profile failed:', error);
            throw error;
        }
    }

    // Helper methods
    isAuthenticated(): boolean {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        return !!(token && user);
    }

    getStoredUser(): User | null {
        try {
            const userStr = localStorage.getItem('user');
            return userStr ? JSON.parse(userStr) : null;
        } catch {
            return null;
        }
    }

    getToken(): string | null {
        return localStorage.getItem('token');
    }

    clearLocalAuth(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
}

export const authService = new AuthService();