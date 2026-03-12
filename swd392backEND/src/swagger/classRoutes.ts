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
 *         keypass:
 *           type: string
 *           description: Enrollment key for the class
 *           maxLength: 100
 *           example: "XkQ3p9mZ"
 *         course_id:
 *           type: string
 *           description: Associated course ID
 *           example: "507f1f77bcf86cd799439012"
 *         teacher_id:
 *           type: string
 *           description: Teacher entity ID who owns this class
 *           example: "507f1f77bcf86cd799439013"
 *         class_name:
 *           type: string
 *           description: Class name
 *           maxLength: 255
 *           example: "CS101 - Spring 2024"
 *         img_cover_link:
 *           type: string
 *           nullable: true
 *           description: Cloudinary URL of the class cover image
 *           maxLength: 500
 *           example: "https://res.cloudinary.com/demo/image/upload/sample.jpg"
 *         status:
 *           type: string
 *           enum: [active, inactive, archived]
 *           description: Class status
 *           example: "active"
 *         date_create:
 *           type: string
 *           format: date-time
 *           description: Class creation date
 *     ClassInput:
 *       type: object
 *       required:
 *         - course_id
 *         - class_name
 *       properties:
 *         course_id:
 *           type: string
 *           description: Course ID to associate with this class
 *           example: "507f1f77bcf86cd799439012"
 *         class_name:
 *           type: string
 *           maxLength: 255
 *           example: "CS101 - Spring 2024"
 *         img_cover_link:
 *           type: string
 *           description: Optional cover image URL
 *           example: "https://res.cloudinary.com/demo/image/upload/sample.jpg"
 *     ClassUpdateInput:
 *       type: object
 *       properties:
 *         class_name:
 *           type: string
 *           maxLength: 255
 *           example: "CS101 - Updated"
 *         keypass:
 *           type: string
 *           maxLength: 100
 *           example: "newKey123"
 *         status:
 *           type: string
 *           enum: [active, inactive, archived]
 *           example: "inactive"
 *         img_cover_link:
 *           type: string
 *           nullable: true
 *           example: "https://res.cloudinary.com/demo/image/upload/sample.jpg"
 */

/**
 * @openapi
 * /api/class/{id}:
 *   get:
 *     tags:
 *       - Classes
 *     summary: Get class by ID
 *     description: "[Public] Retrieve a specific class by its ID."
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
 *     description: "[Teacher] Update class details. Only the teacher who owns this class can update it."
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
 *             $ref: '#/components/schemas/ClassUpdateInput'
 *     responses:
 *       200:
 *         description: Class updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Class'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - You can only update your own class
 *       404:
 *         description: Class not found
 */

/**
 * @openapi
 * /api/teacher/class:
 *   get:
 *     tags:
 *       - Classes
 *     summary: Get classes by teacher
 *     description: "[Teacher] Retrieve all classes owned by the authenticated teacher."
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: Paginated list of classes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Class'
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
 *     summary: Get classes by student
 *     description: "[Student] Retrieve all classes the authenticated student is enrolled in."
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: Paginated list of classes
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Class'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Student access required
 */

/**
 * @openapi
 * /api/class/{classId}/students:
 *   get:
 *     tags:
 *       - Classes
 *     summary: Get students in a class
 *     description: "[Teacher] Retrieve paginated students enrolled in a specific class with optional keyword search."
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: classId
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
 *       - in: query
 *         name: keyword
 *         schema:
 *           type: string
 *           default: ""
 *         description: Search keyword to filter students by name or email
 *     responses:
 *       200:
 *         description: Paginated list of enrolled students
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Teacher access required
 *       404:
 *         description: Class not found
 */

/**
 * @openapi
 * /api/class:
 *   post:
 *     tags:
 *       - Classes
 *     summary: Create a new class
 *     description: "[Teacher] Create a new class. The teacher_id is resolved from the auth cookie and keypass is auto-generated."
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
 *         description: Validation error
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
 *     summary: Regenerate class keypass
 *     description: "[Teacher] Generate a new random enrollment keypass for the class."
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
 *         description: New keypass generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 keypass:
 *                   type: string
 *                   example: "Xkq9mZ3p"
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
 *     description: "[Teacher] Upload a new cover image to Cloudinary. Returns the uploaded image URL — use it with update-image to attach it to a class."
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Image file to upload
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
 *                   example: "https://res.cloudinary.com/demo/image/upload/sample.jpg"
 *       400:
 *         description: No file uploaded
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
 *     description: "[Teacher] Replace an existing cover image on Cloudinary. Verifies the teacher owns the class with that image before replacing."
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *               - url
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: New image file
 *               url:
 *                 type: string
 *                 description: Existing Cloudinary URL to replace
 *                 example: "https://res.cloudinary.com/demo/image/upload/old.jpg"
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
 *                   example: "https://res.cloudinary.com/demo/image/upload/new.jpg"
 *       400:
 *         description: No file uploaded
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - You can only modify images of your own class
 */

/**
 * @openapi
 * /api/teacher/delete-image:
 *   delete:
 *     tags:
 *       - Classes
 *     summary: Delete class cover image
 *     description: "[Teacher] Delete an existing cover image from Cloudinary and clear it from the class record. Verifies teacher ownership."
 *     security:
 *       - cookieAuth: []
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
 *                 description: Cloudinary URL of the image to delete
 *                 example: "https://res.cloudinary.com/demo/image/upload/sample.jpg"
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
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - You can only modify images of your own class
 */

/**
 * @openapi
 * components:
 *   schemas:
 *     ClassDeleteResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           description: Whether the deletion was successful
 *           example: true
 *         message:
 *           type: string
 *           description: Success message
 *           example: "Class deleted successfully"
 *         deletedCounts:
 *           type: object
 *           description: Breakdown of deleted entities
 *           properties:
 *             classes:
 *               type: integer
 *               example: 1
 *             classMaterials:
 *               type: integer
 *               example: 5
 *             enrolls:
 *               type: integer
 *               example: 10
 *             feedback:
 *               type: integer
 *               example: 3
 *             files:
 *               type: integer
 *               example: 2
 *             progressClassMaterial:
 *               type: integer
 *               example: 50
 *             questions:
 *               type: integer
 *               example: 15
 *             quizzes:
 *               type: integer
 *               example: 3
 *             quizAttempts:
 *               type: integer
 *               example: 25
 *             render2d:
 *               type: integer
 *               example: 1
 *             results:
 *               type: integer
 *               example: 75
 *             slides:
 *               type: integer
 *               example: 2
 *             aiContents:
 *               type: integer
 *               description: Number of AI-generated content records deleted
 *               example: 3
 *             aiRequests:
 *               type: integer
 *               description: Number of AI request records deleted
 *               example: 3
 *     ClassDeleteError:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           description: Error type (Class not found, Not allowed, delete_failed)
 *           example: "Class not found"
 *         result:
 *           type: object
 *           nullable: true
 *           example: null
 *         details:
 *           type: object
 *           description: Additional error details (present for delete_failed)
 *           properties:
 *             message:
 *               type: string
 *               example: "Transaction failed"
 */

/**
 * @openapi
 * /api/classes/{id}:
 *   delete:
 *     tags:
 *       - Classes
 *     summary: Delete class (Teacher)
 *     description: "[Teacher] Cascade delete a class and all related data. Only the teacher who owns the class can delete it. Deletes: class materials, enrollments, feedback, files, progress records, questions, quizzes, quiz attempts, render2d, results, slides, AI-generated content (AiContent), and AI requests (AiRequest). All deletions are performed atomically in a transaction."
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID to delete
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Class deleted successfully with deletion counts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClassDeleteResponse'
 *       401:
 *         description: Unauthorized - Valid authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Forbidden: Invalid token"
 *       403:
 *         description: Forbidden - Teacher can only delete own classes
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClassDeleteError'
 *             example:
 *               success: false
 *               error: "Not allowed"
 *               result: null
 *       404:
 *         description: Class not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClassDeleteError'
 *             example:
 *               success: false
 *               error: "Class not found"
 *               result: null
 *       500:
 *         description: Server error - Transaction failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClassDeleteError'
 *             example:
 *               success: false
 *               error: "delete_failed"
 *               details:
 *                 message: "Transaction failed"
 */

/**
 * @openapi
 * /api/admin/classes/{id}:
 *   delete:
 *     tags:
 *       - Classes
 *       - Admin
 *     summary: Delete class (Admin)
 *     description: "[Admin] Cascade delete any class and all related data. Admins can delete any class regardless of ownership. Deletes: class materials, enrollments, feedback, files, progress records, questions, quizzes, quiz attempts, render2d, results, slides, AI-generated content (AiContent), and AI requests (AiRequest). All deletions are performed atomically in a transaction."
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID to delete
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Class deleted successfully with deletion counts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClassDeleteResponse'
 *       401:
 *         description: Unauthorized - Valid authentication required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Forbidden: Invalid token"
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Forbidden: Admins only"
 *       404:
 *         description: Class not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClassDeleteError'
 *             example:
 *               success: false
 *               error: "Class not found"
 *               result: null
 *       500:
 *         description: Server error - Transaction failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClassDeleteError'
 *             example:
 *               success: false
 *               error: "delete_failed"
 *               details:
 *                 message: "Transaction failed"
 */

/**
 * @openapi
 * /api/admin/stats/classes:
 *   get:
 *     tags:
 *       - Classes
 *       - Admin
 *     summary: Get admin class statistics
 *     description: "[Admin] Retrieve comprehensive statistics about classes including counts by status, trends over time, top enrolled classes, and average class size."
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [7days, 30days, 3months, 1year, all]
 *           default: "30days"
 *         description: Time range for statistics
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive, all]
 *           default: "all"
 *         description: Filter by class status
 *     responses:
 *       200:
 *         description: Class statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timeRange:
 *                   type: string
 *                   example: "30days"
 *                 status:
 *                   type: string
 *                   example: "all"
 *                 totalClasses:
 *                   type: integer
 *                   example: 150
 *                 byStatus:
 *                   type: object
 *                   additionalProperties:
 *                     type: integer
 *                   example:
 *                     active: 120
 *                     inactive: 30
 *                 averageClassSize:
 *                   type: number
 *                   example: 25.5
 *                 topEnrolledClasses:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       className:
 *                         type: string
 *                       enrollments:
 *                         type: integer
 *                       classId:
 *                         type: string
 *                 trend:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                       count:
 *                         type: integer
 *       400:
 *         description: Invalid parameters
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */
