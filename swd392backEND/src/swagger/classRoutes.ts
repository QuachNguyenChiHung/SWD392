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
 *         keypass:
 *           type: string
 *           description: Class keypass for enrollment
 *           maxLength: 100
 *         course_id:
 *           type: string
 *           description: Course ID
 *         class_name:
 *           type: string
 *           description: Class name
 *           maxLength: 255
 *         img_cover_link:
 *           type: string
 *           description: Cover image URL
 *         date_create:
 *           type: string
 *           format: date-time
 *           description: Class creation date
 *         status:
 *           type: string
 *           enum: [active, inactive, archived]
 *           description: Class status
 *     CreateClassRequest:
 *       type: object
 *       required:
 *         - keypass
 *         - course_id
 *         - class_name
 *       properties:
 *         keypass:
 *           type: string
 *           description: Class keypass for enrollment
 *           maxLength: 100
 *         course_id:
 *           type: string
 *           description: Course ID
 *         class_name:
 *           type: string
 *           description: Class name
 *           maxLength: 255
 *         img_cover_link:
 *           type: string
 *           description: Cover image URL
 *     UpdateClassRequest:
 *       type: object
 *       properties:
 *         keypass:
 *           type: string
 *           description: Class keypass for enrollment
 *           maxLength: 100
 *         class_name:
 *           type: string
 *           description: Class name
 *           maxLength: 255
 *         img_cover_link:
 *           type: string
 *           description: Cover image URL
 *         status:
 *           type: string
 *           enum: [active, inactive, archived]
 *           description: Class status
 *     ImageUploadResponse:
 *       type: object
 *       properties:
 *         url:
 *           type: string
 *           description: Uploaded image URL
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *
 * /api/class/{id}:
 *   get:
 *     tags:
 *       - Classes
 *     summary: Get class by ID
 *     description: Retrieve a specific class by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *     responses:
 *       200:
 *         description: Class found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Class'
 *       404:
 *         description: Class not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     tags:
 *       - Classes
 *     summary: Update a class
 *     security:
 *       - bearerAuth: []
 *     description: Update an existing class (Teacher only, must be the owner of the class)
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
 *             $ref: '#/components/schemas/UpdateClassRequest'
 *     responses:
 *       200:
 *         description: Class updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Class'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - You can only update your own class
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Class not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *
 * /api/teacher/class:
 *   get:
 *     tags:
 *       - Classes
 *     summary: Get classes for authenticated teacher
 *     security:
 *       - bearerAuth: []
 *     description: Get paginated classes for the authenticated teacher (Teacher only — uses authenticated user id; returns 12 results per page)
 *     parameters:
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
 *         description: List of classes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Class'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Teachers only
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse' 
 *
 * /api/class:
 *   post:
 *     tags:
 *       - Classes
 *     summary: Create a new class
 *     security:
 *       - bearerAuth: []
 *     description: Create a new class (Teacher only)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateClassRequest'
 *     responses:
 *       201:
 *         description: Class created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Class'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Teachers only
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse' 
 *
 * /api/teacher/upload-image:
 *   post:
 *     tags:
 *       - Classes
 *     summary: Upload class cover image
 *     security:
 *       - bearerAuth: []
 *     description: Upload an image to Cloudinary for class cover (Teacher only)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload
 *     responses:
 *       200:
 *         description: Image uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ImageUploadResponse'
 *       400:
 *         description: No file uploaded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Teachers only
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse' 
 *
 * /api/teacher/update-image:
 *   put:
 *     tags:
 *       - Classes
 *     summary: Update class cover image
 *     security:
 *       - bearerAuth: []
 *     description: Update an existing Cloudinary image (Teacher only, must own the class that uses this image)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - url
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: New image file
 *               url:
 *                 type: string
 *                 description: Existing image URL to replace
 *     responses:
 *       200:
 *         description: Image updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ImageUploadResponse'
 *       400:
 *         description: No file uploaded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Teachers only, or not the owner of the class image
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse' 
 *
 * /api/teacher/delete-image:
 *   delete:
 *     tags:
 *       - Classes
 *     summary: Delete class cover image
 *     security:
 *       - bearerAuth: []
 *     description: Delete an image from Cloudinary (Teacher only, must own the class that uses this image)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - url
 *             properties:
 *               url:
 *                 type: string
 *                 description: Image URL to delete
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         description: Unauthorized - Authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Teachers only, or not the owner of the class image
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse' 
 *
 * /api/student/class:
 *   get:
 *     tags:
 *       - Classes
 *     summary: Get classes for authenticated student
 *     security:
 *       - bearerAuth: []
 *     description: Get paginated classes for the authenticated student (Student only — uses authenticated user id; returns 12 results per page)
 *     parameters:
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
 *         description: List of classes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Class'
 *       401:
 *         description: Unauthorized - Authentication required
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
 */
