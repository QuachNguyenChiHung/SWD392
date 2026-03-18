// Export all material API services
export { fileApiService } from './fileApi';
export { quizApiService } from './quizApi';
export { slideApiService } from './slideApi';
export { renderApiService } from './renderApi';
export { questionApiService } from './questionApi';

// Export types for convenience
export type {
    CreateFileDTO,
    UpdateFileDTO
} from './fileApi';

export type {
    CreateQuizDTO,
    UpdateQuizDTO,
    CreateQuizAttemptDTO,
    QuizAttempt
} from './quizApi';

export type {
    CreateSlideDTO,
    UpdateSlideDTO
} from './slideApi';

export type {
    CreateRender2DDTO,
    UpdateRender2DDTO
} from './renderApi';

export type {
    CreateQuestionDTO,
    UpdateQuestionDTO,
    FrontendQuestionData
} from './questionApi';