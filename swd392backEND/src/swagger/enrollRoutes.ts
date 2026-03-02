/**
 * @openapi
 * components:
 *   schemas:
 *     Enroll:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Enrollment ID
 *         class_id:
 *           type: string
 *           description: Class ID
 *         student_id:
 *           type: string
 *           description: Student ID
 *         date_join:
 *           type: string
 *           format: date-time
 *           description: Enrollment date
 *         status:
 *           type: string
 *           enum: [in_progress, completed]
 *           description: Enrollment status
 *         date_end:
 *           type: string
 *           format: date-time
 *           description: Completion date (if completed)
 *     CreateEnrollRequest:
 *       type: object
 *       required:
 *         - keypass
 *       properties:
 *         keypass:
 *           type: string
 *           description: Class keypass for enrollment verification
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           description: Error message
 *         message:
 *           type: string
 *           description: Detailed error message
 *
 *   securitySchemes:
 *     cookieAuth:
 *       type: apiKey
 *       in: cookie
 *       name: Authorization
 *       description: Signed cookie containing Bearer token
 *
 * /api/enroll/{class_id}:
 *   post:
 *     tags:
 *       - Enrollments
 *     summary: Create student enrollment
 *     security:
 *       - cookieAuth: []
 *     description: Enroll the currently logged-in student in a class with keypass verification (Student only)
 *     parameters:
 *       - in: path
 *         name: class_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateEnrollRequest'
 *     responses:
 *       201:
 *         description: Enrollment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Enroll'
 *       400:
 *         description: Bad request - Invalid keypass, student already enrolled, or class not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Students only
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /api/teacher/enroll/{class_id}:
 *   get:
 *     tags:
 *       - Enrollments
 *     summary: Get all enrollments from a class
 *     security:
 *       - cookieAuth: []
 *     description: Get all student enrollments from a specific class (Teacher only, returns 12 results per page)
 *     parameters:
 *       - in: path
 *         name: class_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination (returns 12 results per page)
 *     responses:
 *       200:
 *         description: List of enrollments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Enroll'
 *       403:
 *         description: Forbidden - Teachers only
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /api/enroll/{enroll_id}/completed:
 *   patch:
 *     tags:
 *       - Enrollments
 *     summary: Mark enrollment as completed
 *     security:
 *       - cookieAuth: []
 *     description: Update enrollment status to completed (Teacher only, must be the teacher of the class)
 *     parameters:
 *       - in: path
 *         name: enroll_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Enrollment ID
 *     responses:
 *       200:
 *         description: Enrollment marked as completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Enroll'
 *       403:
 *         description: Forbidden - Only the teacher of this class can mark enrollment as completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */