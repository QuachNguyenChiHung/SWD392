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
 *
 * /api/enroll/{u_id}/{class_id}:
 *   post:
 *     tags:
 *       - Enrollments
 *     summary: Create student enrollment
 *     description: Enroll a student in a class with keypass verification
 *     parameters:
 *       - in: path
 *         name: u_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Student user ID
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
 *         description: Bad request - Invalid keypass, student already enrolled, class not found, or invalid data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /api/enroll/{class_id}:
 *   get:
 *     tags:
 *       - Enrollments
 *     summary: Get all enrollments from a class
 *     description: Get all student enrollments from a specific class (teachers only, returns 12 results per page)
 *     security:
 *       - BearerAuth: []
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
 *       500:
 *         description: Internal server error
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
 *     description: Update enrollment status to completed using enrollment ID
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
 *       404:
 *         description: Enrollment not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */