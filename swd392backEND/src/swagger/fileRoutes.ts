/**
 * @openapi
 * components:
 *   schemas:
 *     File:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the file
 *           example: "507f1f77bcf86cd799439011"
 *         file_name:
 *           type: string
 *           maxLength: 255
 *           description: Name of the file
 *           example: "Lecture Notes.pdf"
 *         file_path:
 *           type: string
 *           maxLength: 500
 *           description: Path or URL to the file
 *           example: "https://res.cloudinary.com/demo/raw/upload/files/lecture.pdf"
 *     FileCreateInput:
 *       type: object
 *       required:
 *         - file_name
 *         - file_path
 *       properties:
 *         file_name:
 *           type: string
 *           maxLength: 255
 *           example: "Lecture Notes.pdf"
 *         file_path:
 *           type: string
 *           maxLength: 500
 *           example: "https://res.cloudinary.com/demo/raw/upload/files/lecture.pdf"
 *     FileUpdateInput:
 *       type: object
 *       properties:
 *         file_name:
 *           type: string
 *           maxLength: 255
 *         file_path:
 *           type: string
 *           maxLength: 500
 */

/**
 * @openapi
 * /api/files:
 *   get:
 *     tags:
 *       - Files
 *     summary: Get all files
 *     description: "[Public] Retrieve paginated list of all files."
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *     responses:
 *       200:
 *         description: List of files
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/File'
 *   post:
 *     tags:
 *       - Files
 *     summary: Upload and create a file
 *     description: |
 *       [Teacher] Upload a file to Cloudinary and create a file entry.
 *       Supports both file upload with metadata or JSON payload.
 *     security:
 *       - cookieAuth: []
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
 *                 description: File to upload (PDF, images, documents, etc.)
 *               file_name:
 *                 type: string
 *                 description: Optional custom name for the file (defaults to original filename)
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FileCreateInput'
 *     responses:
 *       201:
 *         description: File created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/File'
 *       400:
 *         description: File is required
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Teacher role required
 */

/**
 * @openapi
 * /api/files/{id}:
 *   get:
 *     tags:
 *       - Files
 *     summary: Get file by ID
 *     description: "[Public] Retrieve a specific file by ID."
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: File details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/File'
 *       404:
 *         description: File not found
 *   put:
 *     tags:
 *       - Files
 *     summary: Update a file
 *     description: |
 *       [Teacher] Update an existing file.
 *       Supports both file upload (replaces the file) or JSON payload (updates metadata only).
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: New file to replace the existing one
 *               file_name:
 *                 type: string
 *                 description: Optional custom name for the file
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/FileUpdateInput'
 *     responses:
 *       200:
 *         description: File updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/File'
 *       404:
 *         description: File not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Teacher role required
 *   delete:
 *     tags:
 *       - Files
 *     summary: Delete a file
 *     description: "[Teacher] Delete a file."
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
 *         description: File deleted successfully
 *       404:
 *         description: File not found
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Teacher role required
 */

/**
 * @openapi
 * /api/files/by-path:
 *   get:
 *     tags:
 *       - Files
 *     summary: Find file by path
 *     description: "[Public] Find a file by its file path."
 *     parameters:
 *       - in: query
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *         description: File path to search for
 *         example: "https://res.cloudinary.com/demo/raw/upload/files/lecture.pdf"
 *     responses:
 *       200:
 *         description: File found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/File'
 *       400:
 *         description: Path parameter is required
 *       404:
 *         description: File not found
 */
