/**
 * @openapi
 * /cloudinary-demo/file:
 *   post:
 *     tags:
 *       - Cloudinary Demo
 *     summary: Upload file to Cloudinary
 *     description: "[Public] Demo endpoint to upload any file type to Cloudinary."
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
 *                 description: File to upload (any type)
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: URL of the uploaded file
 *                   example: "https://res.cloudinary.com/demo/raw/upload/sample.pdf"
 *                 filename:
 *                   type: string
 *                   description: Original filename
 *                   example: "document.pdf"
 *       400:
 *         description: No file uploaded
 *       500:
 *         description: Upload failed
 */

/**
 * @openapi
 * /cloudinary-demo/file/{url}:
 *   put:
 *     tags:
 *       - Cloudinary Demo
 *     summary: Update file on Cloudinary
 *     description: "[Public] Demo endpoint to update/replace an existing file on Cloudinary."
 *     parameters:
 *       - in: path
 *         name: url
 *         required: true
 *         schema:
 *           type: string
 *         description: Current file URL to replace (URL encoded)
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
 *                 description: New file (any type)
 *     responses:
 *       200:
 *         description: File updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: URL of the new file
 *                   example: "https://res.cloudinary.com/demo/raw/upload/new-document.pdf"
 *                 filename:
 *                   type: string
 *                   description: Original filename
 *                   example: "new-document.pdf"
 *       400:
 *         description: No URL provided or no file uploaded
 *       500:
 *         description: Update failed
 *   delete:
 *     tags:
 *       - Cloudinary Demo
 *     summary: Delete file from Cloudinary
 *     description: "[Public] Demo endpoint to delete a file from Cloudinary."
 *     parameters:
 *       - in: path
 *         name: url
 *         required: true
 *         schema:
 *           type: string
 *         description: File URL to delete (URL encoded)
 *     responses:
 *       200:
 *         description: File deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "File deleted successfully"
 *       404:
 *         description: File not found or already deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "File not found or already deleted"
 *       400:
 *         description: No URL provided
 *       500:
 *         description: Deletion failed
 */

/**
 * @openapi
 * /cloudinary-demo/image:
 *   post:
 *     tags:
 *       - Cloudinary Demo
 *     summary: Upload image to Cloudinary
 *     description: "[Public] Demo endpoint to upload an image to Cloudinary. Accepts common image formats (JPEG, PNG, GIF, WEBP, etc.)."
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
 *                 description: Image file to upload (max 10MB)
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
 * /cloudinary-demo/image/{url}:
 *   put:
 *     tags:
 *       - Cloudinary Demo
 *     summary: Update image on Cloudinary
 *     description: "[Public] Demo endpoint to update/replace an existing image on Cloudinary."
 *     parameters:
 *       - in: path
 *         name: url
 *         required: true
 *         schema:
 *           type: string
 *         description: Current image URL to replace
 *         example: "https://res.cloudinary.com/demo/image/upload/sample.jpg"
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
 *                 description: New image file (max 10MB)
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
 *     description: "[Public] Demo endpoint to delete an image from Cloudinary."
 *     parameters:
 *       - in: path
 *         name: url
 *         required: true
 *         schema:
 *           type: string
 *         description: Image URL to delete
 *         example: "https://res.cloudinary.com/demo/image/upload/sample.jpg"
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
/**
 * @openapi
 * /cloudinary-demo/file:
 *   post:
 *     tags:
 *       - Cloudinary Demo
 *     summary: Upload file to Cloudinary
 *     description: "[Public] Demo endpoint to upload any file type to Cloudinary."
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
 *                 description: File to upload (any type)
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: URL of the uploaded file
 *                   example: "https://res.cloudinary.com/demo/raw/upload/sample.pdf"
 *                 filename:
 *                   type: string
 *                   description: Original filename
 *                   example: "document.pdf"
 *       400:
 *         description: No file uploaded
 *       500:
 *         description: Upload failed
 */

/**
 * @openapi
 * /cloudinary-demo/file/{url}:
 *   put:
 *     tags:
 *       - Cloudinary Demo
 *     summary: Update file on Cloudinary
 *     description: "[Public] Demo endpoint to update/replace an existing file on Cloudinary."
 *     parameters:
 *       - in: path
 *         name: url
 *         required: true
 *         schema:
 *           type: string
 *         description: Current file URL to replace (URL encoded)
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
 *                 description: New file (any type)
 *     responses:
 *       200:
 *         description: File updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 url:
 *                   type: string
 *                   description: URL of the new file
 *                   example: "https://res.cloudinary.com/demo/raw/upload/new-document.pdf"
 *                 filename:
 *                   type: string
 *                   description: Original filename
 *                   example: "new-document.pdf"
 *       400:
 *         description: No URL provided or no file uploaded
 *       500:
 *         description: Update failed
 *   delete:
 *     tags:
 *       - Cloudinary Demo
 *     summary: Delete file from Cloudinary
 *     description: "[Public] Demo endpoint to delete a file from Cloudinary."
 *     parameters:
 *       - in: path
 *         name: url
 *         required: true
 *         schema:
 *           type: string
 *         description: File URL to delete (URL encoded)
 *     responses:
 *       200:
 *         description: File deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "File deleted successfully"
 *       404:
 *         description: File not found or already deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "File not found or already deleted"
 *       400:
 *         description: No URL provided
 *       500:
 *         description: Deletion failed
 */
