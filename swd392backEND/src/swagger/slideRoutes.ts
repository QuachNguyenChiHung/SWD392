/**
 * @openapi
 * components:
 *   schemas:
 *     Slide:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the slide
 *           example: "507f1f77bcf86cd799439011"
 *         slide_name:
 *           type: string
 *           maxLength: 255
 *           description: Name of the slide
 *           example: "Introduction Slides"
 *         file_path:
 *           type: string
 *           maxLength: 500
 *           description: Path or URL to the slide file
 *           example: "https://res.cloudinary.com/demo/raw/upload/slides/intro.pptx"
 *     SlideCreateInput:
 *       type: object
 *       required:
 *         - slide_name
 *         - file_path
 *       properties:
 *         slide_name:
 *           type: string
 *           maxLength: 255
 *           example: "Introduction Slides"
 *         file_path:
 *           type: string
 *           maxLength: 500
 *           example: "https://res.cloudinary.com/demo/raw/upload/slides/intro.pptx"
 *     SlideUpdateInput:
 *       type: object
 *       properties:
 *         slide_name:
 *           type: string
 *           maxLength: 255
 *         file_path:
 *           type: string
 *           maxLength: 500
 */

/**
 * @openapi
 * /api/slides:
 *   get:
 *     tags:
 *       - Slides
 *     summary: Get all slides
 *     description: "[Public] Retrieve paginated list of all slides."
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *     responses:
 *       200:
 *         description: List of slides
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Slide'
 *       500:
 *         description: Internal server error
 *   post:
 *     tags:
 *       - Slides
 *     summary: Create a slide
 *     description: "[Teacher] Upload a slide file. The file will be uploaded to Cloudinary and a slide entry will be created."
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
 *                 description: Slide file to upload (PPT, PPTX, PDF, etc.)
 *     responses:
 *       201:
 *         description: Slide created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Slide'
 *       400:
 *         description: File is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "File is required"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Teacher role required
 */

/**
 * @openapi
 * /api/slides/{id}:
 *   get:
 *     tags:
 *       - Slides
 *     summary: Get slide by ID
 *     description: "[Public] Retrieve a specific slide by ID."
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Slide details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Slide'
 *       404:
 *         description: Slide not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Slide not found"
 *       500:
 *         description: Internal server error
 *   put:
 *     tags:
 *       - Slides
 *     summary: Update a slide
 *     description: |
 *       [Teacher] Update an existing slide.
 *       Supports both file upload (replaces the slide file) or JSON payload (updates metadata only).
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
 *               slide:
 *                 type: string
 *                 format: binary
 *                 description: New slide file to replace the existing one (PPT, PPTX, PDF, etc.)
 *               slide_name:
 *                 type: string
 *                 description: Optional custom name for the slide
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SlideUpdateInput'
 *     responses:
 *       200:
 *         description: Slide updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Slide'
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Teacher role required
 *       404:
 *         description: Slide not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Slide not found"
 *       500:
 *         description: Internal server error
 *   delete:
 *     tags:
 *       - Slides
 *     summary: Delete a slide
 *     description: "[Teacher] Delete a slide."
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
 *         description: Slide deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Slide deleted successfully"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Teacher role required
 *       404:
 *         description: Slide not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Slide not found"
 *       500:
 *         description: Internal server error
 */

/**
 * @openapi
 * /api/slides/by-path:
 *   get:
 *     tags:
 *       - Slides
 *     summary: Find slide by path
 *     description: "[Public] Find a slide by its file path."
 *     parameters:
 *       - in: query
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *         description: File path to search for
 *         example: "https://res.cloudinary.com/demo/raw/upload/slides/intro.pptx"
 *     responses:
 *       200:
 *         description: Slide found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Slide'
 *       400:
 *         description: Path parameter is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "path query parameter is required"
 *       404:
 *         description: Slide not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Slide not found"
 *       500:
 *         description: Internal server error
 */
