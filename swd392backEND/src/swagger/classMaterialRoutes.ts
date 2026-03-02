/**
 * @openapi
 * components:
 *   schemas:
 *     ClassMaterial:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ClassMaterial ID
 *           example: "507f1f77bcf86cd799439011"
 *         title:
 *           type: string
 *           description: Material title
 *           example: "Introduction Slide"
 *         type:
 *           type: string
 *           enum: [file, slide, quiz, 2d_render]
 *           description: Type of content
 *           example: "slide"
 *         order_num:
 *           type: integer
 *           description: Display order within the class
 *           example: 1
 *         class_assign_id:
 *           type: string
 *           description: ID of the class this material belongs to
 *           example: "507f1f77bcf86cd799439012"
 *         topic_id:
 *           type: string
 *           nullable: true
 *           description: ID of the topic this material belongs to
 *           example: "507f1f77bcf86cd799439013"
 *         content_id:
 *           type: string
 *           nullable: true
 *           description: ID of the associated content document
 *           example: "507f1f77bcf86cd799439014"
 *         is_ai_material:
 *           type: boolean
 *           description: Whether this material was AI-generated
 *           example: false
 *         ai_content_id:
 *           type: string
 *           nullable: true
 *           description: ID of AI content if is_ai_material is true
 *         dateCreate:
 *           type: string
 *           format: date-time
 *           description: Creation date
 *         dateUpdate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Last update date
 *     ClassMaterialWithContent:
 *       allOf:
 *         - $ref: '#/components/schemas/ClassMaterial'
 *         - type: object
 *           properties:
 *             content:
 *               type: object
 *               description: Populated content document (file/slide/quiz/2d_render)
 *               nullable: true
 *     ClassMaterialInput:
 *       type: object
 *       required:
 *         - class_id
 *         - type
 *         - title
 *         - content_data
 *       properties:
 *         class_id:
 *           type: string
 *           example: "507f1f77bcf86cd799439012"
 *         topic_id:
 *           type: string
 *           example: "507f1f77bcf86cd799439013"
 *         type:
 *           type: string
 *           enum: [file, slide, quiz, 2d_render]
 *           example: "slide"
 *         title:
 *           type: string
 *           example: "Introduction Slide"
 *         content_data:
 *           type: object
 *           description: Content payload specific to the type chosen
 *           example: { "title": "Introduction Slide", "pages": [] }
 *     ClassMaterialUpdateInput:
 *       type: object
 *       properties:
 *         topic_id:
 *           type: string
 *         type:
 *           type: string
 *           enum: [file, slide, quiz, 2d_render]
 *         order_num:
 *           type: integer
 *         title:
 *           type: string
 *         is_ai_material:
 *           type: boolean
 *         ai_content_id:
 *           type: string
 *         content_data:
 *           type: object
 *           description: Optional updated content payload
 *     ReorderInput:
 *       type: object
 *       required:
 *         - class_id
 *         - material_ids
 *       properties:
 *         class_id:
 *           type: string
 *           example: "507f1f77bcf86cd799439012"
 *         material_ids:
 *           type: array
 *           description: Ordered array of material IDs (new order)
 *           items:
 *             type: string
 *           example: ["id1", "id2", "id3"]
 */

/**
 * @openapi
 * /api/class-materials:
 *   get:
 *     tags:
 *       - ClassMaterials
 *     summary: Get materials by class
 *     description: Retrieve all materials belonging to a class (paginated)
 *     parameters:
 *       - in: query
 *         name: class_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID to filter materials
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: List of class materials
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ClassMaterial'
 *       400:
 *         description: class_id is required
 *   post:
 *     tags:
 *       - ClassMaterials
 *     summary: Create a new class material
 *     description: Create a class material along with its content (teacher only)
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClassMaterialInput'
 *     responses:
 *       201:
 *         description: Class material created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClassMaterial'
 *       400:
 *         description: Validation error or invalid content type
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Teacher access required
 */

/**
 * @openapi
 * /api/class-materials/all:
 *   get:
 *     tags:
 *       - ClassMaterials
 *     summary: Get all class materials
 *     description: Retrieve all class materials (admin only, paginated)
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
 *         description: List of all class materials
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ClassMaterial'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin access required
 */

/**
 * @openapi
 * /api/class-materials/count:
 *   get:
 *     tags:
 *       - ClassMaterials
 *     summary: Get material count for a class
 *     description: Get the total number of materials in a class
 *     parameters:
 *       - in: query
 *         name: class_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *     responses:
 *       200:
 *         description: Material count
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   example: 12
 *       400:
 *         description: class_id is required
 */

/**
 * @openapi
 * /api/class-materials/reorder:
 *   patch:
 *     tags:
 *       - ClassMaterials
 *     summary: Reorder class materials
 *     description: Update the display order of materials in a class (teacher only)
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReorderInput'
 *     responses:
 *       200:
 *         description: Materials reordered successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Teacher access required
 */

/**
 * @openapi
 * /api/class-materials/topic/{topicId}:
 *   get:
 *     tags:
 *       - ClassMaterials
 *     summary: Get materials by topic
 *     description: Retrieve all materials belonging to a topic
 *     parameters:
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: string
 *         description: Topic ID
 *     responses:
 *       200:
 *         description: List of materials for the topic
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ClassMaterial'
 */

/**
 * @openapi
 * /api/class-materials/topic/{topicId}/class/{classId}:
 *   get:
 *     tags:
 *       - ClassMaterials
 *     summary: Get material by topic and class
 *     description: Retrieve material matching both a topic and a class
 *     parameters:
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: string
 *         description: Topic ID
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID
 *     responses:
 *       200:
 *         description: Class material
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClassMaterial'
 *       404:
 *         description: Class material not found
 */

/**
 * @openapi
 * /api/class-materials/{id}:
 *   get:
 *     tags:
 *       - ClassMaterials
 *     summary: Get material by ID (with content)
 *     description: Retrieve a specific class material including its populated content document
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ClassMaterial ID
 *     responses:
 *       200:
 *         description: Class material with populated content
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClassMaterialWithContent'
 *       404:
 *         description: Class material not found
 *   put:
 *     tags:
 *       - ClassMaterials
 *     summary: Update a class material
 *     description: Update material metadata and/or its content (teacher only)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ClassMaterial ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClassMaterialUpdateInput'
 *     responses:
 *       200:
 *         description: Material updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClassMaterial'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Teacher access required
 *       404:
 *         description: Class material not found
 *   delete:
 *     tags:
 *       - ClassMaterials
 *     summary: Delete a class material
 *     description: Delete a class material and its associated content (teacher only)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ClassMaterial ID
 *     responses:
 *       200:
 *         description: Material deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Class material deleted successfully"
 *                 data:
 *                   $ref: '#/components/schemas/ClassMaterial'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Teacher access required
 *       404:
 *         description: Class material not found
 */

/**
 * @openapi
 * /api/class-materials/{id}/toggle-ai:
 *   patch:
 *     tags:
 *       - ClassMaterials
 *     summary: Toggle AI material flag
 *     description: Toggle whether a material is marked as AI-generated (teacher only)
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ClassMaterial ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ai_content_id:
 *                 type: string
 *                 description: AI content ID to link (optional)
 *     responses:
 *       200:
 *         description: AI flag toggled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Teacher access required
 *       404:
 *         description: Class material not found
 */
