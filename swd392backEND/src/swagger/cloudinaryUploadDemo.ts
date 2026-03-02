/**
 * @openapi
 * /cloudinary-demo:
 *   post:
 *     tags:
 *       - Cloudinary Demo
 *     summary: Upload image to Cloudinary
 *     description: Demo endpoint to upload an image to Cloudinary
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
 *                   description: URL of the uploaded image
 *                   example: "https://res.cloudinary.com/demo/image/upload/sample.jpg"
 *       400:
 *         description: No file uploaded
 *       500:
 *         description: Upload failed
 */

/**
 * @openapi
 * /cloudinary-demo/{url}:
 *   put:
 *     tags:
 *       - Cloudinary Demo
 *     summary: Update image on Cloudinary
 *     description: Demo endpoint to update/replace an existing image on Cloudinary
 *     parameters:
 *       - in: path
 *         name: url
 *         required: true
 *         schema:
 *           type: string
 *         description: Current image URL to replace
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
 *                   description: URL of the new image
 *                   example: "https://res.cloudinary.com/demo/image/upload/new-sample.jpg"
 *       400:
 *         description: No URL provided or no file uploaded
 *       500:
 *         description: Update failed
 *   delete:
 *     tags:
 *       - Cloudinary Demo
 *     summary: Delete image from Cloudinary
 *     description: Demo endpoint to delete an image from Cloudinary
 *     parameters:
 *       - in: path
 *         name: url
 *         required: true
 *         schema:
 *           type: string
 *         description: Image URL to delete
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
 *         description: No URL provided
 *       500:
 *         description: Deletion failed
 */
