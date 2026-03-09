/**
 * @openapi
 * components:
 *   schemas:
 *     Question:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the question
 *           example: "507f1f77bcf86cd799439011"
 *         quiz_id:
 *           type: string
 *           description: ID of the quiz this question belongs to
 *           example: "507f1f77bcf86cd799439012"
 *         options:
 *           type: array
 *           items:
 *             type: object
 *           description: Array of answer options
 *           example: [{"text": "Option A"}, {"text": "Option B"}, {"text": "Option C"}, {"text": "Option D"}]
 *         correct_index:
 *           type: integer
 *           minimum: 0
 *           description: Index of the correct answer in options array
 *           example: 2
 *         type:
 *           type: string
 *           enum: [multiple_choice, true_false]
 *           description: Type of question
 *           default: multiple_choice
 *           example: "multiple_choice"
 *     QuestionCreateInput:
 *       type: object
 *       required:
 *         - quiz_id
 *         - options
 *         - correct_index
 *       properties:
 *         quiz_id:
 *           type: string
 *           example: "507f1f77bcf86cd799439012"
 *         options:
 *           type: array
 *           items:
 *             type: object
 *           minItems: 2
 *           example: [{"text": "Option A"}, {"text": "Option B"}]
 *         correct_index:
 *           type: integer
 *           minimum: 0
 *           example: 0
 *         type:
 *           type: string
 *           enum: [multiple_choice, true_false]
 *     QuestionUpdateInput:
 *       type: object
 *       properties:
 *         options:
 *           type: array
 *           items:
 *             type: object
 *           minItems: 2
 *         correct_index:
 *           type: integer
 *           minimum: 0
 *         type:
 *           type: string
 *           enum: [multiple_choice, true_false]
 */

/**
 * @openapi
 * /api/questions:
 *   get:
 *     tags:
 *       - Questions
 *     summary: Get all questions
 *     description: "[Admin] Retrieve paginated list of all questions."
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *     responses:
 *       200:
 *         description: List of questions
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Question'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin role required
 *   post:
 *     tags:
 *       - Questions
 *     summary: Create a question
 *     description: "[Teacher] Create a new question for a quiz."
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QuestionCreateInput'
 *     responses:
 *       201:
 *         description: Question created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Question'
 *       404:
 *         description: Quiz not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Teacher role required
 */

/**
 * @openapi
 * /api/questions/{id}:
 *   get:
 *     tags:
 *       - Questions
 *     summary: Get question by ID
 *     description: "[Public] Retrieve a specific question by ID."
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Question'
 *       404:
 *         description: Question not found
 *   put:
 *     tags:
 *       - Questions
 *     summary: Update a question
 *     description: "[Teacher] Update an existing question."
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QuestionUpdateInput'
 *     responses:
 *       200:
 *         description: Question updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Question'
 *       404:
 *         description: Question not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Teacher role required
 *   delete:
 *     tags:
 *       - Questions
 *     summary: Delete a question
 *     description: "[Teacher] Delete a question."
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Question deleted successfully
 *       404:
 *         description: Question not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Teacher role required
 */

/**
 * @openapi
 * /api/quizzes/{quizId}/questions:
 *   get:
 *     tags:
 *       - Questions
 *     summary: Get questions by quiz
 *     description: "[Public] Retrieve all questions for a specific quiz."
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the quiz
 *     responses:
 *       200:
 *         description: List of questions for the quiz
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Question'
 */
