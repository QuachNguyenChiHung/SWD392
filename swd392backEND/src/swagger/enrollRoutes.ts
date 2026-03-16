/**
 * @openapi
 * components:
 *   schemas:
 *     Enrollment:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Enrollment ID
 *           example: "507f1f77bcf86cd799439011"
 *         student_id:
 *           type: string
 *           description: Student ID
 *           example: "507f1f77bcf86cd799439012"
 *         class_id:
 *           type: string
 *           description: Class ID
 *           example: "507f1f77bcf86cd799439013"
 *         status:
 *           type: string
 *           enum: [in_progress, completed]
 *           description: Enrollment status
 *           example: "in_progress"
 *         date_join:
 *           type: string
 *           format: date-time
 *           description: Date of enrollment
 *         date_end:
 *           type: string
 *           format: date-time
 *           description: Date when enrollment was marked as completed
 *           nullable: true
 */

/**
 * @openapi
 * /api/enroll/student:
 *   get:
 *     tags:
 *       - Enrollments
 *     summary: Get my enrollments
 *     description: "[Student] Get all enrollments for the authenticated student."
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: List of student's enrollments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Enrollment'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Student access required
 */

/**
 * @openapi
 * /api/enroll/keypass:
 *   post:
 *     tags:
 *       - Enrollments
 *     summary: Enroll by keypass
 *     description: "[Student] Enroll in a class using a keypass. The class is resolved from the keypass. Progress records are automatically created for all active class materials."
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - keypass
 *             properties:
 *               keypass:
 *                 type: string
 *                 description: Class enrollment keypass
 *                 example: "ABC123XYZ"
 *     responses:
 *       201:
 *         description: Enrollment successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Enrollment'
 *       400:
 *         description: Bad request - Invalid keypass or already enrolled
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Student access required
 */

/**
 * @openapi
 * /api/enroll/invite/{class_id}:
 *   post:
 *     tags:
 *       - Enrollments
 *     summary: Invite student to class
 *     description: "[Teacher] Invite a student to a class by providing their user ID. Only the teacher of the class can invite students. Progress records are automatically created for all active class materials."
 *     security:
 *       - cookieAuth: []
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
 *             type: object
 *             required:
 *               - student_id
 *             properties:
 *               student_id:
 *                 type: string
 *                 description: Student's user ID
 *                 example: "507f1f77bcf86cd799439012"
 *     responses:
 *       201:
 *         description: Student enrolled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Enrollment'
 *       400:
 *         description: Bad request - Student already enrolled or class not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Must be the teacher of this class
 */

/**
 * @openapi
 * /api/enroll/{class_id}:
 *   post:
 *     tags:
 *       - Enrollments
 *     summary: Enroll in a class
 *     description: "[Student] Enroll in a class using the class ID. On successful enrollment, progress records are automatically created for all active class materials."
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: class_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID to enroll in
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               keypass:
 *                 type: string
 *                 description: Class enrollment key (if required)
 *                 example: "ABC123XYZ"
 *     responses:
 *       201:
 *         description: Enrollment successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Enrollment'
 *       400:
 *         description: Bad request - Already enrolled or invalid keypass
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Student access required
 *       404:
 *         description: Class not found
 */

/**
 * @openapi
 * /api/teacher/enroll/{class_id}:
 *   get:
 *     tags:
 *       - Enrollments
 *     summary: Get enrollments by class
 *     description: "[Teacher] Get all enrollments for a specific class."
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: class_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: List of enrollments
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 enrollments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Enrollment'
 *                 total:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Teacher access required
 *       404:
 *         description: Class not found
 */

/**
 * @openapi
 * /api/enroll/{enroll_id}/completed:
 *   patch:
 *     tags:
 *       - Enrollments
 *     summary: Mark enrollment as completed
 *     description: "[Teacher] Mark a student's enrollment as completed. Only the teacher of that specific class can do this."
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
 *         description: Enrollment marked as completed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Enrollment'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Must be the teacher of this class
 *       404:
 *         description: Enrollment not found
 */
