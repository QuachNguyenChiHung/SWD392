/**
 * @openapi
 * components:
 *   schemas:
 *     Teacher:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Teacher document ID
 *           example: "507f1f77bcf86cd799439011"
 *         user_id:
 *           type: string
 *           description: Reference to the User document
 *           example: "507f1f77bcf86cd799439012"
 *         credential:
 *           type: string
 *           nullable: true
 *           description: Teacher credential or bio
 *           example: "MSc in Mathematics, 4 years teaching experience"
 *         date_create:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *           example: "2026-03-01T08:00:00Z"
 *     TeacherWithUser:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/User'
 *         credential:
 *           type: string
 *           nullable: true
 *         date_create:
 *           type: string
 *           format: date-time
 *     TeacherResponse:
 *       type: object
 *       properties:
 *         credential:
 *           type: string
 *           nullable: true
 *           description: Teacher credential or bio
 *           example: "MSc in Mathematics, 4 years teaching experience"
 *         user:
 *           $ref: '#/components/schemas/User'
 *
 */

/**
 * @openapi
 * /api/teachers/{id}:
 *   get:
 *     tags:
 *       - Teachers
 *     summary: Get teacher by ID
 *     description: "[Public] Retrieve a teacher document by its teacher ID. The returned teacher includes populated user information (password excluded)."
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Teacher document ID
 *     responses:
 *       200:
 *         description: Teacher details with populated user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeacherResponse'
 *       404:
 *         description: Teacher not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Teacher not found"
 *
 */

/**
 * @openapi
 * /api/teachers/by-user/{userId}:
 *   get:
 *     tags:
 *       - Teachers
 *     summary: Get teacher by user ID
 *     description: "[Public] Retrieve a teacher document associated with a given user ID. Returns populated user info."
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User document ID
 *     responses:
 *       200:
 *         description: Teacher details for the given user
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TeacherResponse'
 *       404:
 *         description: Teacher not found for the given user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Teacher not found for the provided userId"
 */
