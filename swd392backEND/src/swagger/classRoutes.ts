/**
 * @openapi
 * components:
 *   schemas:
 *     Class:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Class ID
 *           example: "507f1f77bcf86cd799439011"
 *         name:
 *           type: string
 *           description: Class name
 *           example: "CS101 - Spring 2024"
 *         description:
 *           type: string
 *           description: Class description
 *           example: "Introduction to Computer Science"
 *         teacher_id:
 *           type: string
 *           description: Teacher ID
 *           example: "507f1f77bcf86cd799439012"
 *         course_id:
 *           type: string
 *           description: Course ID
 *           example: "507f1f77bcf86cd799439013"
 *         keypass:
 *           type: string
 *           description: Class enrollment key
 *           example: "ABC123XYZ"
 *         image_cover:
 *           type: string
 *           description: Class cover image URL
 *           example: "https://cloudinary.com/image.jpg"
 *         start_date:
 *           type: string
 *           format: date-time
 *           description: Class start date
 *         end_date:
 *           type: string
 *           format: date-time
 *           description: Class end date
 *         status:
 *           type: string
 *           enum: [active, inactive, completed]
 *           description: Class status
 *           example: "active"
 *         date_create:
 *           type: string
 *           format: date-time
 *           description: Class creation date
 *     ClassInput:
 *       type: object
 *       required:
 *         - name
 *         - course_id
 *       properties:
 *         name:
 *           type: string
 *           example: "CS101 - Spring 2024"
 *         description:
 *           type: string
 *           example: "Introduction to Computer Science"
 *         course_id:
 *           type: string
 *           example: "507f1f77bcf86cd799439013"
 *         start_date:
 *           type: string
 *           format: date-time
 *         end_date:
 *           type: string
 *           format: date-time
 */

/**
 * @openapi
 * /api/class/{id}:
 *   get:
 *     tags:
 *       - Classes
 *     summary: Get class by ID
 *     description: Retrieve a specific class by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *     responses:
 *       200:
 *         description: Class details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Class'
 *       404:
 *         description: Class not found
 *   put:
 *     tags:
 *       - Classes
 *     summary: Update class
 *     description: Update class information (teacher only)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClassInput'
 *     responses:
 *       200:
 *         description: Class updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Class'
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Teacher access required
 *       404:
 *         description: Class not found
 */

/**
 * @openapi
 * /api/teacher/class:
 *   get:
 *     tags:
 *       - Classes
 *     summary: Get teacher's classes
 *     description: Retrieve all classes taught by the authenticated teacher
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Results per page
 *     responses:
 *       200:
 *         description: List of teacher's classes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 classes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Class'
 *                 total:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Teacher access required
 */

/**
 * @openapi
 * /api/student/class:
 *   get:
 *     tags:
 *       - Classes
 *     summary: Get student's classes
 *     description: Retrieve all classes the authenticated student is enrolled in
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Results per page
 *     responses:
 *       200:
 *         description: List of student's classes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 classes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Class'
 *                 total:
 *                   type: integer
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Student access required
 */

/**
 * @openapi
 * /api/class:
 *   post:
 *     tags:
 *       - Classes
 *     summary: Create new class
 *     description: Create a new class (teacher only)
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClassInput'
 *     responses:
 *       201:
 *         description: Class created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Class'
 *       400:
 *         description: Bad request - Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Teacher access required
 */

/**
 * @openapi
 * /api/class/{classId}/generate-keypass:
 *   post:
 *     tags:
 *       - Classes
 *     summary: Generate class keypass
 *     description: Generate or regenerate enrollment key for a class (teacher only)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *     responses:
 *       200:
 *         description: Keypass generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 keypass:
 *                   type: string
 *                   example: "ABC123XYZ"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Teacher access required
 *       404:
 *         description: Class not found
 */

/**
 * @openapi
 * /api/teacher/upload-image:
 *   post:
 *     tags:
 *       - Classes
 *     summary: Upload class cover image
 *     description: Upload a cover image for a class (teacher only)
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload
 *               class_id:
 *                 type: string
 *                 description: Class ID
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   example: "https://cloudinary.com/image.jpg"
 *       400:
 *         description: Bad request - No file uploaded
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Teacher access required
 */

/**
 * @openapi
 * /api/teacher/update-image:
 *   put:
 *     tags:
 *       - Classes
 *     summary: Update class cover image
 *     description: Update the cover image of a class (teacher only)
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: New image file
 *               class_id:
 *                 type: string
 *                 description: Class ID
 *               old_url:
 *                 type: string
 *                 description: URL of the old image to replace
 *     responses:
 *       200:
 *         description: Image updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   example: "https://cloudinary.com/new-image.jpg"
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Teacher access required
 */

/**
 * @openapi
 * /api/teacher/delete-image:
 *   delete:
 *     tags:
 *       - Classes
 *     summary: Delete class cover image
 *     description: Delete the cover image of a class (teacher only)
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               class_id:
 *                 type: string
 *                 description: Class ID
 *               url:
 *                 type: string
 *                 description: URL of the image to delete
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Image deleted successfully"
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Teacher access required
 */
