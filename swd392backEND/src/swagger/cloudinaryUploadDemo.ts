/**
 * @openapi
 * /cloudinary-demo:
 *   post:
 *     summary: Upload an image
 *     consumes:
 *       - multipart/form-data
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Uploaded image URL
 *       400:
 *         description: No file uploaded
 */

/**
 * @openapi
 * /cloudinary-demo/{url}:
 *   put:
 *     summary: Update an image
 *     parameters:
 *       - in: path
 *         name: url
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Updated image URL
 *       400:
 *         description: No URL or file provided
 */

/**
 * @openapi
 * /cloudinary-demo/{url}:
 *   delete:
 *     summary: Delete an image
 *     parameters:
 *       - in: path
 *         name: url
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Image deleted successfully
 *       400:
 *         description: No URL provided
 */
