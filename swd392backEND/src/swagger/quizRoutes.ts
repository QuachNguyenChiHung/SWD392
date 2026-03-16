/**
 * @openapi
 * components:
 *   schemas:
 *     Quiz:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the quiz
 *           example: "507f1f77bcf86cd799439011"
 *         title:
 *           type: string
 *           maxLength: 255
 *           description: Title of the quiz
 *           example: "Chapter 1 Quiz"
 *         type:
 *           type: string
 *           maxLength: 50
 *           description: Type of quiz
 *           example: "practice"
 *         available_date:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Date when quiz becomes available
 *           example: "2024-01-15T10:30:00Z"
 *         max_attempt_number:
 *           type: integer
 *           nullable: true
 *           description: Maximum number of attempts allowed
 *           example: 3
 *         end_date:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Date when quiz ends
 *           example: "2024-01-30T23:59:59Z"
 *         status:
 *           type: boolean
 *           description: Whether quiz is active
 *           default: true
 *           example: true
 *     QuizCreateInput:
 *       type: object
 *       required:
 *         - title
 *         - type
 *       properties:
 *         title:
 *           type: string
 *           maxLength: 255
 *           example: "Chapter 1 Quiz"
 *         type:
 *           type: string
 *           maxLength: 50
 *           example: "practice"
 *         available_date:
 *           type: string
 *           format: date-time
 *         max_attempt_number:
 *           type: integer
 *         end_date:
 *           type: string
 *           format: date-time
 *         status:
 *           type: boolean
 *     QuizUpdateInput:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           maxLength: 255
 *         type:
 *           type: string
 *           maxLength: 50
 *         available_date:
 *           type: string
 *           format: date-time
 *         max_attempt_number:
 *           type: integer
 *         end_date:
 *           type: string
 *           format: date-time
 *         status:
 *           type: boolean
 *     QuizAttempt:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           example: "507f1f77bcf86cd799439011"
 *         quiz_id:
 *           type: string
 *           example: "507f1f77bcf86cd799439012"
 *         user_id:
 *           type: string
 *           example: "507f1f77bcf86cd799439013"
 *         attempt_number:
 *           type: integer
 *           example: 1
 *         date:
 *           type: string
 *           format: date-time
 *         record_json:
 *           type: object
 *           nullable: true
 *     QuizDeletionResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: "Quiz deleted successfully"
 *         deleted:
 *           type: object
 *           properties:
 *             quiz:
 *               type: integer
 *               description: Number of quizzes deleted
 *               example: 1
 *             questions:
 *               type: integer
 *               description: Number of questions deleted
 *               example: 10
 *             quizAttempts:
 *               type: integer
 *               description: Number of quiz attempts deleted
 *               example: 25
 *             classMaterials:
 *               type: integer
 *               description: Number of class materials deleted
 *               example: 2
 *             progressClassMaterials:
 *               type: integer
 *               description: Number of progress records deleted
 *               example: 15
 */

/**
 * @openapi
 * /api/quizzes:
 *   get:
 *     tags:
 *       - Quizzes
 *     summary: Get all quizzes
 *     description: "[Public] Retrieve paginated list of all quizzes."
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *     responses:
 *       200:
 *         description: List of quizzes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Quiz'
 *   post:
 *     tags:
 *       - Quizzes
 *     summary: Create a quiz
 *     description: "[Teacher] Create a new quiz."
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/QuizCreateInput'
 *     responses:
 *       201:
 *         description: Quiz created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quiz'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Teacher role required
 */

/**
 * @openapi
 * /api/quizzes/{id}:
 *   get:
 *     tags:
 *       - Quizzes
 *     summary: Get quiz by ID
 *     description: "[Public] Retrieve a specific quiz by ID."
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Quiz details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quiz'
 *       404:
 *         description: Quiz not found
 *   put:
 *     tags:
 *       - Quizzes
 *     summary: Update a quiz
 *     description: "[Teacher] Update an existing quiz."
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
 *             $ref: '#/components/schemas/QuizUpdateInput'
 *     responses:
 *       200:
 *         description: Quiz updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quiz'
 *       404:
 *         description: Quiz not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Teacher role required
 *   delete:
 *     tags:
 *       - Quizzes
 *     summary: Delete a quiz (Teacher)
 *     description: |
 *       [Teacher] Delete a quiz with cascade deletion of all related entities.
 *       
 *       **Cascade Deletion:**
 *       - Questions associated with the quiz
 *       - QuizAttempts (student submissions)
 *       - ClassMaterials (where type='quiz' and content_id=quizId)
 *       - ProgressClassMaterials (student progress on quiz materials)
 *       
 *       **Permission Restrictions:**
 *       - Teachers can only delete quizzes assigned to classes they own
 *       - If quiz is not assigned to any class (orphaned), teacher can delete it
 *       - Uses atomic transaction to ensure data consistency
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *     responses:
 *       200:
 *         description: Quiz and all related entities deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuizDeletionResponse'
 *       404:
 *         description: Quiz not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Quiz not found"
 *       403:
 *         description: Permission denied - Teacher can only delete quizzes from their own classes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Permission denied: You can only delete quizzes from your own classes"
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized: User not authenticated"
 */

/**
 * @openapi
 * /api/admin/quizzes/{id}:
 *   delete:
 *     tags:
 *       - Quizzes
 *       - Admin
 *     summary: Delete a quiz (Admin)
 *     description: |
 *       [Admin] Delete any quiz with cascade deletion of all related entities.
 *       
 *       **Cascade Deletion:**
 *       - Questions associated with the quiz
 *       - QuizAttempts (student submissions)
 *       - ClassMaterials (where type='quiz' and content_id=quizId)
 *       - ProgressClassMaterials (student progress on quiz materials)
 *       
 *       **Permission:**
 *       - Admin can delete ANY quiz without restrictions
 *       - Uses atomic transaction to ensure data consistency
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Quiz ID
 *     responses:
 *       200:
 *         description: Quiz and all related entities deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuizDeletionResponse'
 *             example:
 *               message: "Quiz deleted successfully"
 *               deleted:
 *                 quiz: 1
 *                 questions: 10
 *                 quizAttempts: 25
 *                 classMaterials: 2
 *                 progressClassMaterials: 15
 *       404:
 *         description: Quiz not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Quiz not found"
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Unauthorized: User not authenticated"
 *       403:
 *         description: Forbidden - Admin role required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Forbidden: Admins only"
 */

/**
 * @openapi
 * /api/quizzes/{id}/toggle-status:
 *   patch:
 *     tags:
 *       - Quizzes
 *     summary: Toggle quiz status
 *     description: "[Teacher] Toggle quiz active/inactive status."
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
 *         description: Status toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Quiz'
 *       404:
 *         description: Quiz not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Teacher role required
 */

/**
 * @openapi
 * /api/quizzes/{quizId}/attempts:
 *   get:
 *     tags:
 *       - Quiz Attempts
 *     summary: Get quiz attempts
 *     description: "[Teacher] Get all attempts for a specific quiz."
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *     responses:
 *       200:
 *         description: List of quiz attempts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/QuizAttempt'
 *       404:
 *         description: Quiz not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Teacher role required
 */

/**
 * @openapi
 * /api/users/{userId}/quiz-attempts:
 *   get:
 *     tags:
 *       - Quiz Attempts
 *     summary: Get user's quiz attempts
 *     description: "[Public] Get all quiz attempts by a specific user."
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *     responses:
 *       200:
 *         description: List of user's quiz attempts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/QuizAttempt'
 */

/**
 * @openapi
 * /api/quizzes/{quizId}/attempts/{userId}:
 *   post:
 *     tags:
 *       - Quiz Attempts
 *     summary: Create quiz attempt
 *     description: "[Public] Submit a quiz attempt for a user."
 *     parameters:
 *       - in: path
 *         name: quizId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - quiz_id
 *             properties:
 *               quiz_id:
 *                 type: string
 *               record_json:
 *                 type: object
 *     responses:
 *       201:
 *         description: Quiz attempt created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/QuizAttempt'
 *       400:
 *         description: Bad request (max attempts reached, quiz not available, etc.)
 *       404:
 *         description: Quiz not found
 */
