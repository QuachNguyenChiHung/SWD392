/**
 * @openapi
 * components:
 *   schemas:
 *     QuizAttemptDetail:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the quiz attempt
 *           example: "507f1f77bcf86cd799439011"
 *         quiz_id:
 *           oneOf:
 *             - type: string
 *             - type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 type:
 *                   type: string
 *           description: Reference to the quiz (populated with title and type)
 *           example: { "_id": "507f1f77bcf86cd799439012", "title": "Chapter 1 Quiz", "type": "practice" }
 *         user_id:
 *           oneOf:
 *             - type: string
 *             - type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *           description: Reference to the user (populated with username and email)
 *           example: { "_id": "507f1f77bcf86cd799439013", "username": "student1", "email": "student1@example.com" }
 *         attempt_number:
 *           type: integer
 *           description: The attempt number for this quiz
 *           example: 1
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date of the attempt
 *         record_json:
 *           type: object
 *           nullable: true
 *           description: Additional record data in JSON format
 *     Result:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "507f1f77bcf86cd799439020"
 *         quiz_attempt_id:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         text:
 *           type: string
 *           nullable: true
 *           description: Question text
 *           example: "What is 2 + 2?"
 *         options:
 *           type: object
 *           nullable: true
 *           description: Answer options
 *         options_picked_index:
 *           type: integer
 *           nullable: true
 *           description: Index of the selected option
 *           example: 0
 *         isCorrect:
 *           type: boolean
 *           description: Whether the answer was correct
 *           example: true
 *     Score:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           description: Total number of questions
 *           example: 10
 *         correct:
 *           type: integer
 *           description: Number of correct answers
 *           example: 8
 *         score:
 *           type: number
 *           description: Score value
 *           example: 8
 *         percentage:
 *           type: number
 *           description: Score as percentage
 *           example: 80
 *     QuizAttemptWithResults:
 *       type: object
 *       properties:
 *         attempt:
 *           $ref: '#/components/schemas/QuizAttemptDetail'
 *         results:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Result'
 *         score:
 *           $ref: '#/components/schemas/Score'
 *     SubmitQuizAttemptInput:
 *       type: object
 *       required:
 *         - quiz_id
 *         - answers
 *       properties:
 *         quiz_id:
 *           type: string
 *           description: ID of the quiz to attempt
 *           example: "507f1f77bcf86cd799439012"
 *         record_json:
 *           type: object
 *           nullable: true
 *           description: Optional additional record data
 *         answers:
 *           type: array
 *           description: Array of answer submissions
 *           items:
 *             type: object
 *             required:
 *               - isCorrect
 *             properties:
 *               text:
 *                 type: string
 *                 description: Question text
 *                 example: "What is 2 + 2?"
 *               options:
 *                 type: object
 *                 description: Answer options
 *               options_picked_index:
 *                 type: integer
 *                 minimum: 0
 *                 description: Index of the selected option
 *                 example: 0
 *     SubmitQuizAttemptResponse:
 *       type: object
 *       properties:
 *         attempt:
 *           $ref: '#/components/schemas/QuizAttemptDetail'
 *         submissionResult:
 *           type: object
 *           properties:
 *             message:
 *               type: string
 *               example: "Quiz submitted successfully"
 *             score:
 *               $ref: '#/components/schemas/Score'
 */

/**
 * @openapi
 * /api/quizzes/{quizId}/attempts/with-results:
 *   get:
 *     tags:
 *       - Quiz Attempts
 *     summary: Get all attempts with results for a quiz
 *     description: "[Teacher] Retrieve paginated list of all quiz attempts with results for a specific quiz."
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *     responses:
 *       200:
 *         description: List of quiz attempts with results
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/QuizAttemptWithResults'
 *       400:
 *         description: Invalid Quiz ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid Quiz ID"
 *       404:
 *         description: Quiz not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Quiz not found"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Teacher role required
 */

/**
 * @openapi
 * /api/quizzes/{quizId}/users/{userId}/latest-attempt:
 *   get:
 *     tags:
 *       - Quiz Attempts
 *     summary: Get latest attempt for a student on a quiz
 *     description: "[Teacher] Retrieve the latest quiz attempt with results for a specific student and quiz."
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID of the student
 *     responses:
 *       200:
 *         description: Latest quiz attempt with results
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuizAttemptWithResults'
 *       400:
 *         description: Invalid parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Valid Quiz ID and User ID are required"
 *       404:
 *         description: Quiz attempt not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No attempts found"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Teacher role required
 */

/**
 * @openapi
 * /api/quiz-attempts/submit:
 *   post:
 *     tags:
 *       - Quiz Attempts
 *     summary: Submit a quiz attempt
 *     description: "[Student] Create a new quiz attempt and submit answers in one operation. The user is identified from the authentication token."
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SubmitQuizAttemptInput'
 *     responses:
 *       201:
 *         description: Quiz attempt created and submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SubmitQuizAttemptResponse'
 *       400:
 *         description: Invalid submission data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Invalid submission data"
 *       401:
 *         description: Unauthorized - User authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User authentication required"
 *       403:
 *         description: Forbidden - Student role required
 */

/**
 * @openapi
 * /api/quiz-attempts/{attemptId}:
 *   get:
 *     tags:
 *       - Quiz Attempts
 *     summary: Get quiz attempt by ID
 *     description: "[Authenticated] Retrieve basic quiz attempt information by its ID."
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz Attempt ID
 *     responses:
 *       200:
 *         description: Quiz attempt details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuizAttemptDetail'
 *       400:
 *         description: Invalid Attempt ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Valid Attempt ID is required"
 *       404:
 *         description: Quiz attempt not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *   delete:
 *     tags:
 *       - Quiz Attempts
 *     summary: Delete a quiz attempt
 *     description: "[Teacher] Delete a quiz attempt by its ID."
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz Attempt ID
 *     responses:
 *       200:
 *         description: Quiz attempt deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Quiz attempt deleted successfully"
 *       400:
 *         description: Invalid Attempt ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Valid Attempt ID is required"
 *       404:
 *         description: Quiz attempt not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Quiz attempt not found"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Teacher role required
 */

/**
 * @openapi
 * /api/quiz-attempts/{attemptId}/with-results:
 *   get:
 *     tags:
 *       - Quiz Attempts
 *     summary: Get quiz attempt with results
 *     description: "[Authenticated] Retrieve a specific quiz attempt along with all its results and score."
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: attemptId
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz Attempt ID
 *     responses:
 *       200:
 *         description: Quiz attempt with results and score
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuizAttemptWithResults'
 *       400:
 *         description: Invalid Attempt ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Valid Attempt ID is required"
 *       404:
 *         description: Quiz attempt not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */

/**
 * @openapi
 * /api/my-quiz-attempts:
 *   get:
 *     tags:
 *       - Quiz Attempts
 *     summary: Get my quiz attempts
 *     description: "[Student] Retrieve paginated list of all quiz attempts for the authenticated student."
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *     responses:
 *       200:
 *         description: List of student's quiz attempts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/QuizAttemptDetail'
 *       401:
 *         description: Unauthorized - User authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "User authentication required"
 *       403:
 *         description: Forbidden - Student role required
 */
