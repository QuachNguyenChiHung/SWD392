import QuizAttemptRepo from "../repository/QuizAttemptRepo.ts";
import ResultRepo from "../repository/ResultRepo.ts";
import QuizRepo from "../repository/QuizRepo.ts";
import QuestionRepo from "../repository/QuestionRepo.ts";
import type { CreateQuizAttemptDTO } from "../dto/QuizDTO.ts";
import type { CreateResultDTO } from "../dto/ResultDTO.ts";

class QuizAttemptService {
    // Quiz Attempt Methods
    async getQuizAttemptById(id: string) {
        const attempt = await QuizAttemptRepo.getQuizAttemptById(id);
        if (!attempt) {
            return { error: "Quiz attempt not found" };
        }
        return attempt;
    }

    async getAllQuizAttempts(page: number = 1) {
        return await QuizAttemptRepo.getAllQuizAttempts(page);
    }

    async getQuizAttemptsByQuizId(quizId: string, page: number = 1) {
        return await QuizAttemptRepo.getQuizAttemptsByQuizId(quizId, page);
    }

    async getQuizAttemptsByUserId(userId: string, page: number = 1) {
        return await QuizAttemptRepo.getQuizAttemptsByUserId(userId, page);
    }

    async createQuizAttempt(attemptData: CreateQuizAttemptDTO & { user_id: string }) {
        try {
            // Validate quiz exists
            const quiz = await QuizRepo.getQuizById(attemptData.quiz_id);
            if (!quiz) {
                return { error: "Quiz not found" };
            }

            // Check if quiz is active
            if (!quiz.status) {
                return { error: "Quiz is not active" };
            }

            // Check attempt limits
            const currentAttempts = await QuizAttemptRepo.getQuizAttemptCount(
                attemptData.quiz_id,
                attemptData.user_id
            );

            if (quiz.max_attempt_number && currentAttempts >= quiz.max_attempt_number) {
                return { error: "Maximum attempts reached for this quiz" };
            }

            // Set attempt number
            const attemptNumber = currentAttempts + 1;
            const newAttemptData = {
                ...attemptData,
                attempt_number: attemptNumber
            };

            return await QuizAttemptRepo.createQuizAttempt(newAttemptData);
        } catch (error) {
            return { error: "Failed to create quiz attempt" };
        }
    }

    async updateQuizAttempt(id: string, updateData: Partial<CreateQuizAttemptDTO>) {
        const attempt = await QuizAttemptRepo.getQuizAttemptById(id);
        if (!attempt) {
            return { error: "Quiz attempt not found" };
        }
        return await QuizAttemptRepo.updateQuizAttempt(id, updateData);
    }

    async deleteQuizAttempt(id: string) {
        const attempt = await QuizAttemptRepo.getQuizAttemptById(id);
        if (!attempt) {
            return { error: "Quiz attempt not found" };
        }

        // Delete associated results first
        await ResultRepo.deleteResultsByQuizAttemptId(id);

        return await QuizAttemptRepo.deleteQuizAttempt(id);
    }

    async getLatestQuizAttempt(quizId: string, userId: string) {
        return await QuizAttemptRepo.getLatestQuizAttempt(quizId, userId);
    }

    async getQuizAttemptWithDetails(id: string) {
        const attemptDetails = await QuizAttemptRepo.getQuizAttemptWithDetails(id);
        if (!attemptDetails) {
            return { error: "Quiz attempt not found" };
        }
        return attemptDetails;
    }

    // Result Methods within Quiz Attempt context
    async getResultsForQuizAttempt(quizAttemptId: string) {
        const attempt = await QuizAttemptRepo.getQuizAttemptById(quizAttemptId);
        if (!attempt) {
            return { error: "Quiz attempt not found" };
        }
        return await ResultRepo.getResultsByQuizAttemptId(quizAttemptId);
    }

    async createResultForQuizAttempt(quizAttemptId: string, resultData: Omit<CreateResultDTO, 'quiz_attempt_id'>) {
        const attempt = await QuizAttemptRepo.getQuizAttemptById(quizAttemptId);
        if (!attempt) {
            return { error: "Quiz attempt not found" };
        }

        const newResultData: CreateResultDTO = {
            ...resultData,
            quiz_attempt_id: quizAttemptId
        };

        return await ResultRepo.createResult(newResultData);
    }

    async createMultipleResultsForQuizAttempt(quizAttemptId: string, resultsData: Omit<CreateResultDTO, 'quiz_attempt_id'>[]) {
        const attempt = await QuizAttemptRepo.getQuizAttemptById(quizAttemptId);
        if (!attempt) {
            return { error: "Quiz attempt not found" };
        }

        const newResultsData: CreateResultDTO[] = resultsData.map(resultData => ({
            ...resultData,
            quiz_attempt_id: quizAttemptId
        }));

        return await ResultRepo.createMultipleResults(newResultsData);
    }

    async getQuizAttemptScore(quizAttemptId: string) {
        const attempt = await QuizAttemptRepo.getQuizAttemptById(quizAttemptId);
        if (!attempt) {
            return { error: "Quiz attempt not found" };
        }

        const totalResults = await ResultRepo.getResultsCount(quizAttemptId);
        const correctResults = await ResultRepo.getCorrectResultsCount(quizAttemptId);

        return {
            total: totalResults,
            correct: correctResults,
            score: totalResults > 0 ? (correctResults / totalResults) * 100 : 0,
            percentage: totalResults > 0 ? Math.round((correctResults / totalResults) * 100) : 0
        };
    }

    async getQuizAttemptWithResults(id: string) {
        const attemptDetails = await this.getQuizAttemptWithDetails(id);
        if (!attemptDetails || 'error' in attemptDetails) {
            return attemptDetails || { error: "Quiz attempt not found" };
        }

        const results = await this.getResultsForQuizAttempt(id);
        const score = await this.getQuizAttemptScore(id);

        return {
            attempt: attemptDetails,
            results: 'error' in results ? [] : results,
            score: 'error' in score ? null : score
        };
    }

    // Additional methods for controller support
    async getQuizAttemptsWithResultsByQuizId(quizId: string, page: number = 1) {
        try {
            const attempts = await QuizAttemptRepo.getQuizAttemptsByQuizId(quizId, page);

            const attemptsWithResults = await Promise.all(
                attempts.map(async (attempt: any) => {
                    const attemptId = attempt._id?.toString() || attempt.id?.toString();
                    if (!attemptId) {
                        return {
                            attempt,
                            results: [],
                            score: null,
                            error: "Invalid attempt ID"
                        };
                    }
                    const results = await ResultRepo.getResultsByQuizAttemptId(attemptId);
                    const score = await this.getQuizAttemptScore(attemptId);
                    return {
                        attempt,
                        results: 'error' in results ? [] : results,
                        score: 'error' in score ? null : score
                    };
                })
            );

            return attemptsWithResults;
        } catch (error) {
            return { error: "Failed to fetch quiz attempts with results" };
        }
    }

    async getLatestQuizAttemptWithResults(quizId: string, userId: string) {
        try {
            const latestAttempt = await QuizAttemptRepo.getLatestQuizAttempt(quizId, userId);
            if (!latestAttempt) {
                return { error: "No quiz attempts found for this user and quiz" };
            }

            const attemptId = latestAttempt._id?.toString() || latestAttempt.id?.toString();
            if (!attemptId) {
                return { error: "Invalid attempt ID" };
            }

            const results = await this.getResultsForQuizAttempt(attemptId);
            const score = await this.getQuizAttemptScore(attemptId);

            return {
                attempt: latestAttempt,
                results: 'error' in results ? [] : results,
                score: 'error' in score ? null : score
            };
        } catch (error) {
            return { error: "Failed to fetch latest quiz attempt with results" };
        }
    }

    async createAndSubmitQuizAttempt(
        attemptData: CreateQuizAttemptDTO & { user_id: string },
        answers: Omit<CreateResultDTO, 'quiz_attempt_id' | 'isCorrect'>[]
    ) {
        try {
            // Fetch questions for this quiz to grade answers server-side
            const questions = await QuestionRepo.getQuestionsByQuizId(attemptData.quiz_id);
            if (!questions || questions.length === 0) {
                return { error: "No questions found for this quiz" };
            }

            // Grade each answer by comparing options_picked_index with correct_index
            const gradedAnswers: Omit<CreateResultDTO, 'quiz_attempt_id'>[] = answers.map((answer, index) => {
                const question = questions[index];
                const isCorrect = question
                    ? answer.options_picked_index === question.correct_index
                    : false;
                return {
                    ...answer,
                    isCorrect
                };
            });

            // Create the quiz attempt
            const newAttempt = await this.createQuizAttempt(attemptData);
            if ('error' in newAttempt) {
                return newAttempt;
            }

            // Get the attempt ID safely
            const attemptId = newAttempt._id?.toString() || newAttempt.id?.toString();
            if (!attemptId) {
                return { error: "Failed to get created attempt ID" };
            }

            // Submit the graded answers
            const submissionResult = await this.submitQuizAttempt(attemptId, gradedAnswers);
            if ('error' in submissionResult) {
                // Clean up the attempt if submission failed
                await QuizAttemptRepo.deleteQuizAttempt(attemptId);
                return submissionResult;
            }

            // Return the complete result with attempt details
            return {
                attempt: newAttempt,
                submissionResult: submissionResult
            };
        } catch (error) {
            return { error: "Failed to create and submit quiz attempt" };
        }
    }

    async submitQuizAttempt(quizAttemptId: string, answers: Omit<CreateResultDTO, 'quiz_attempt_id'>[]) {
        try {
            // Create all results for the quiz attempt
            const results = await this.createMultipleResultsForQuizAttempt(quizAttemptId, answers);
            if ('error' in results) {
                return results;
            }

            // Calculate and return the final score
            const score = await this.getQuizAttemptScore(quizAttemptId);

            return {
                message: "Quiz attempt submitted successfully",
                results: results,
                score: score
            };
        } catch (error) {
            return { error: "Failed to submit quiz attempt" };
        }
    }
}

export default new QuizAttemptService;