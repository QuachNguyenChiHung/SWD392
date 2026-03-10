/**
 * @openapi
 * components:
 *   schemas:
 *     ProgressClassMaterial:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Progress record ID
 *           example: "507f1f77bcf86cd799439011"
 *         enroll_id:
 *           type: string
 *           description: Enrollment ID
 *           example: "507f1f77bcf86cd799439012"
 *         classmaterial_id:
 *           type: string
 *           description: Class Material ID
 *           example: "507f1f77bcf86cd799439013"
 *         completion_status:
 *           type: string
 *           enum: [in_progress, completed]
 *           description: Completion status
 *           example: "in_progress"
 *         date_completed:
 *           type: string
 *           format: date-time
 *           description: Date when the material was completed
 *           nullable: true
 *     ClassProgressSummary:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *           description: Total number of active class materials
 *           example: 10
 *         completed:
 *           type: integer
 *           description: Number of completed materials
 *           example: 3
 *         not_completed:
 *           type: integer
 *           description: Number of not completed materials
 *           example: 7
 *         progress:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProgressClassMaterial'
 *     TeacherClassProgress:
 *       type: object
 *       properties:
 *         total_materials:
 *           type: integer
 *           description: Total number of active class materials
 *           example: 10
 *         students:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               enroll_id:
 *                 type: string
 *                 example: "507f1f77bcf86cd799439012"
 *               student:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   username:
 *                     type: string
 *                   email:
 *                     type: string
 *               status:
 *                 type: string
 *                 enum: [in_progress, completed]
 *               total:
 *                 type: integer
 *               completed:
 *                 type: integer
 *               not_completed:
 *                 type: integer
 */

/**
 * @openapi
 * /api/progress/{class_id}/{classmaterial_id}:
 *   post:
 *     tags:
 *       - Progress
 *     summary: Create progress for a class material
 *     description: "[Student] Create a progress record for a specific class material. Enrollment is resolved from the authenticated student and class ID."
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: class_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *       - in: path
 *         name: classmaterial_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class Material ID
 *     responses:
 *       201:
 *         description: Progress record created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProgressClassMaterial'
 *       400:
 *         description: Bad request - Enrollment not found or progress already exists
 *       401:
 *         description: Unauthorized
 */

/**
 * @openapi
 * /api/progress/{class_id}/{classmaterial_id}/completed:
 *   patch:
 *     tags:
 *       - Progress
 *     summary: Mark progress as completed
 *     description: "[Student] Mark a class material's progress as completed for the authenticated student."
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: class_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *       - in: path
 *         name: classmaterial_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class Material ID
 *     responses:
 *       200:
 *         description: Progress marked as completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProgressClassMaterial'
 *       400:
 *         description: Bad request - Enrollment or progress record not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @openapi
 * /api/progress/{enroll_id}:
 *   get:
 *     tags:
 *       - Progress
 *     summary: Get student progress by enrollment
 *     description: "Get all progress records for a specific enrollment. Returns completed vs not completed counts for active materials."
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: enroll_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Enrollment ID
 *     responses:
 *       200:
 *         description: Student progress summary
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClassProgressSummary'
 *       400:
 *         description: Bad request - Enrollment not found
 *       401:
 *         description: Unauthorized
 */

/**
 * @openapi
 * /api/progress/teacher/{enroll_id}:
 *   get:
 *     tags:
 *       - Progress
 *     summary: Get progress by enrollment (teacher)
 *     description: "[Teacher] Get progress records for a specific enrollment."
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: enroll_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Enrollment ID
 *     responses:
 *       200:
 *         description: Enrollment progress summary
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClassProgressSummary'
 *       400:
 *         description: Bad request - Missing parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Teacher access required
 */
