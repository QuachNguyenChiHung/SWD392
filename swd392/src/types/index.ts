// User roles
export const UserRole = {
  GUEST: 'GUEST',
  STUDENT: 'STUDENT',
  TEACHER: 'TEACHER',
  MODERATOR: 'MODERATOR',
  ADMIN: 'ADMIN'
} as const;

export type UserRole = typeof UserRole[keyof typeof UserRole];

// User interface
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

// Auth state interface
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Class interface
export interface Class {
  id: string;
  name: string;
  code: string;
  teacherId: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Lesson interface
export interface Lesson {
  id: string;
  classId: string;
  title: string;
  content: string;
  isAIGenerated: boolean;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Quiz interface
export interface Quiz {
  id: string;
  classId: string;
  title: string;
  questions: Question[];
  maxAttempts?: number;
  availableFrom?: Date;
  availableUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Question interface
export interface Question {
  id: string;
  content: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'interactive';
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  has2DVisualization?: boolean;
}
