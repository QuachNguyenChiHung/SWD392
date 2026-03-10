/**
 * @openapi
 * components:
 *   schemas:
 *     ClassMaterial:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique identifier for the class material
 *           example: "507f1f77bcf86cd799439011"
 *         title:
 *           type: string
 *           description: Title of the material
 *           maxLength: 255
 *           example: "Introduction to Algebra"
 *         type:
 *           type: string
 *           enum: [file, slide, 2d_render, quiz]
 *           description: Type of content material
 *           example: "slide"
 *         order_num:
 *           type: integer
 *           description: Display order within the class (positive integer)
 *           minimum: 1
 *           example: 1
 *         class_assign_id:
 *           type: string
 *           description: Reference to the class this material belongs to
 *           example: "507f1f77bcf86cd799439012"
 *         topic_id:
 *           type: string
 *           nullable: true
 *           description: Reference to the topic this material belongs to (optional)
 *           example: "507f1f77bcf86cd799439013"
 *         content_id:
 *           type: string
 *           nullable: true
 *           description: Reference to the associated content document
 *           example: "507f1f77bcf86cd799439014"
 *         status:
 *           type: string
 *           enum: [published, draft, reviewed, deleted]
 *           description: Moderation status of the material
 *           example: "draft"
 *         isFlagged:
 *           type: boolean
 *           description: Whether this material has been flagged by a student for re-moderation
 *           default: false
 *           example: false
 *         isFlaggable:
 *           type: boolean
 *           description: Whether this material can still be flagged (false after moderator final verification)
 *           default: true
 *           example: true
 *         is_ai_material:
 *           type: boolean
 *           description: Flag indicating if this material was AI-generated
 *           default: false
 *           example: false
 *         ai_content_id:
 *           type: string
 *           nullable: true
 *           description: Reference to AI content when is_ai_material is true
 *           example: "507f1f77bcf86cd799439015"
 *         dateCreate:
 *           type: string
 *           format: date-time
 *           description: Timestamp when the material was created
 *           example: "2024-01-15T10:30:00Z"
 *         dateUpdate:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Timestamp when the material was last updated
 *           example: "2024-01-16T14:20:00Z"
 *     ClassMaterialWithContent:
 *       allOf:
 *         - $ref: '#/components/schemas/ClassMaterial'
 *         - type: object
 *           properties:
 *             content:
 *               type: object
 *               description: |
 *                 Populated content entity based on material type:
 *                 - For 'file' type: File entity with filename, url, etc.
 *                 - For 'quiz' type: Quiz entity with questions array
 *                 - For 'slide' type: Slide entity with pages array
 *                 - For '2d_render' type: Render2D entity with render data
 *               nullable: true
 *               oneOf:
 *                 - type: object
 *                   description: File entity
 *                   properties:
 *                     _id:
 *                       type: string
 *                     filename:
 *                       type: string
 *                     url:
 *                       type: string
 *                 - type: object
 *                   description: Quiz entity with questions
 *                   properties:
 *                     _id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     questions:
 *                       type: array
 *                       items:
 *                         type: object
 *                 - type: object
 *                   description: Slide entity
 *                   properties:
 *                     _id:
 *                       type: string
 *                     title:
 *                       type: string
 *                     pages:
 *                       type: array
 *                 - type: object
 *                   description: Render2D entity
 *                   properties:
 *                     _id:
 *                       type: string
 *     ClassMaterialInput:
 *       type: object
 *       required:
 *         - class_assign_id
 *         - type
 *         - title
 *       properties:
 *         class_assign_id:
 *           type: string
 *           description: ID of the class to assign the material to
 *           example: "507f1f77bcf86cd799439012"
 *         topic_id:
 *           type: string
 *           description: Optional topic ID to categorize the material
 *           example: "507f1f77bcf86cd799439013"
 *         type:
 *           type: string
 *           enum: [file, slide, 2d_render, quiz]
 *           description: Type of content material to create
 *           example: "slide"
 *         title:
 *           type: string
 *           maxLength: 255
 *           description: Title for the material
 *           example: "Introduction to Algebra"
 *         order_num:
 *           type: integer
 *           minimum: 1
 *           description: Display order (auto-generated if not provided)
 *           example: 1
 *         content_id:
 *           type: string
 *           description: Optional existing content ID to link
 *           example: "507f1f77bcf86cd799439014"
 *         is_ai_material:
 *           type: boolean
 *           description: Mark as AI-generated material
 *           default: false
 *         ai_content_id:
 *           type: string
 *           description: AI content reference if applicable
 *         content_data:
 *           type: object
 *           description: Content payload specific to the material type
 *           example: 
 *             title: "Introduction Slide"
 *             pages: []
 *     ClassMaterialUpdateInput:
 *       type: object
 *       properties:
 *         topic_id:
 *           type: string
 *           description: Update the topic assignment
 *         type:
 *           type: string
 *           enum: [file, slide, 2d_render, quiz]
 *           description: Change the material type
 *         status:
 *           type: string
 *           enum: [published, draft, reviewed, deleted]
 *           description: Update the moderation status
 *         order_num:
 *           type: integer
 *           minimum: 1
 *           description: Update the display order
 *         title:
 *           type: string
 *           maxLength: 255
 *           description: Update the material title
 *         content_id:
 *           type: string
 *           description: Update the reference to the associated content document (file, slide, quiz, etc.)
 *         is_ai_material:
 *           type: boolean
 *           description: Update AI-generated flag
 *         ai_content_id:
 *           type: string
 *           description: Update AI content reference
 *         isFlagged:
 *           type: boolean
 *           description: Update flagged status
 *         isFlaggable:
 *           type: boolean
 *           description: Update whether the material can be flagged
 *       description: |
 *         Note: The `dateUpdate` field is automatically set by the backend on each update and should not be included in the request body.
 *     ReorderMaterialsInput:
 *       type: object
 *       required:
 *         - class_id
 *         - material_ids
 *       properties:
 *         class_id:
 *           type: string
 *           description: ID of the class containing the materials
 *           example: "507f1f77bcf86cd799439012"
 *         material_ids:
 *           type: array
 *           description: Array of material IDs in their new order
 *           items:
 *             type: string
 *           minItems: 1
 *           example: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439016", "507f1f77bcf86cd799439017"]
 *     ToggleAiMaterialInput:
 *       type: object
 *       properties:
 *         ai_content_id:
 *           type: string
 *           description: AI content ID to associate (optional)
 *           example: "507f1f77bcf86cd799439015"
 *     ChangeStatusInput:
 *       type: object
 *       required:
 *         - status
 *       properties:
 *         status:
 *           type: string
 *           enum: [published, draft, reviewed, deleted]
 *           description: New status to set for the material
 *           example: "reviewed"
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Error message
 *           example: "Validation error or resource not found"
 *     ClassMaterialCount:
 *       type: object
 *       properties:
 *         count:
 *           type: integer
 *           description: Total number of materials in the class
 *           example: 12
 */

/**
 * @openapi
 * /api/class-materials:
 *   get:
 *     tags:
 *       - ClassMaterials
 *     summary: Get class materials by class ID
 *     description: "[Public] Retrieve all materials belonging to a specific class with pagination support."
 *     parameters:
 *       - in: query
 *         name: class_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID to filter materials by
 *         example: "507f1f77bcf86cd799439012"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination (12 items per page)
 *         example: 1
 *     responses:
 *       200:
 *         description: Successfully retrieved list of class materials
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ClassMaterial'
 *       400:
 *         description: Bad request - class_id parameter is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "class_id is required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   post:
 *     tags:
 *       - ClassMaterials
 *     summary: Create a new class material
 *     description: "[Teacher] Create a class material with associated content. If the material status is active (not draft/deleted), progress records are automatically created for all enrolled students in the class."
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClassMaterialInput'
 *           examples:
 *             slideExample:
 *               summary: Create a slide material
 *               value:
 *                 class_assign_id: "507f1f77bcf86cd799439012"
 *                 topic_id: "507f1f77bcf86cd799439013"
 *                 type: "slide"
 *                 title: "Introduction to Algebra"
 *                 content_data:
 *                   title: "Introduction to Algebra"
 *                   pages: []
 *             quizExample:
 *               summary: Create a quiz material
 *               value:
 *                 class_assign_id: "507f1f77bcf86cd799439012"
 *                 type: "quiz"
 *                 title: "Algebra Quiz 1"
 *                 content_data:
 *                   title: "Algebra Quiz 1"
 *                   questions: []
 *     responses:
 *       201:
 *         description: Class material created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClassMaterial'
 *       400:
 *         description: Validation error or invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingFields:
 *                 summary: Missing required fields
 *                 value:
 *                   message: "class_assign_id and type are required"
 *               invalidType:
 *                 summary: Invalid content type
 *                 value:
 *                   message: "Invalid material type provided"
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - teacher role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/class-materials/all:
 *   get:
 *     tags:
 *       - ClassMaterials
 *     summary: Get all class materials
 *     description: "[Admin] Retrieve all class materials across all classes with pagination."
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination (12 items per page)
 *         example: 1
 *     responses:
 *       200:
 *         description: Successfully retrieved list of all class materials
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ClassMaterial'
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/class-materials/count:
 *   get:
 *     tags:
 *       - ClassMaterials
 *     summary: Get material count for a class
 *     description: "[Public] Get the total number of materials in a specific class."
 *     parameters:
 *       - in: query
 *         name: class_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID to count materials for
 *         example: "507f1f77bcf86cd799439012"
 *     responses:
 *       200:
 *         description: Successfully retrieved material count
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClassMaterialCount'
 *       400:
 *         description: Bad request - class_id parameter is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "class_id is required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/class-materials/reorder:
 *   patch:
 *     tags:
 *       - ClassMaterials
 *     summary: Reorder class materials
 *     description: "[Teacher] Update the display order of materials within a class."
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReorderMaterialsInput'
 *           example:
 *             class_id: "507f1f77bcf86cd799439012"
 *             material_ids: ["507f1f77bcf86cd799439011", "507f1f77bcf86cd799439016", "507f1f77bcf86cd799439017"]
 *     responses:
 *       200:
 *         description: Materials reordered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Materials reordered successfully"
 *                 updated_count:
 *                   type: integer
 *                   example: 3
 *       400:
 *         description: Validation error - invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - teacher role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/class-materials/topic/{topicId}:
 *   get:
 *     tags:
 *       - ClassMaterials
 *     summary: Get materials by topic
 *     description: "[Public] Retrieve all class materials associated with a specific topic."
 *     parameters:
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: string
 *         description: Topic ID to filter materials by
 *         example: "507f1f77bcf86cd799439013"
 *     responses:
 *       200:
 *         description: Successfully retrieved materials for the topic
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ClassMaterial'
 *       404:
 *         description: Topic not found or no materials found for topic
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/class-materials/topic/{topicId}/class/{classId}:
 *   get:
 *     tags:
 *       - ClassMaterials
 *     summary: Get material by topic and class
 *     description: "[Public] Retrieve the specific material that matches both a topic and a class."
 *     parameters:
 *       - in: path
 *         name: topicId
 *         required: true
 *         schema:
 *           type: string
 *         description: Topic ID to match
 *         example: "507f1f77bcf86cd799439013"
 *       - in: path
 *         name: classId
 *         required: true
 *         schema:
 *           type: string
 *         description: Class ID to match
 *         example: "507f1f77bcf86cd799439012"
 *     responses:
 *       200:
 *         description: Successfully retrieved the matching material
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClassMaterial'
 *       404:
 *         description: No material found matching both topic and class
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Class material not found"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/class-materials/{id}:
 *   get:
 *     tags:
 *       - ClassMaterials
 *     summary: Get material by ID with content
 *     description: "[Public] Retrieve a specific class material by ID. Automatically includes populated content based on material type (File entity for 'file' type, Quiz with Questions for 'quiz' type, Slide for 'slide' type, or Render2D for '2d_render' type)."
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class material ID
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Successfully retrieved class material with populated content entity based on type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ClassMaterialWithContent'
 *             examples:
 *               slideExample:
 *                 summary: Slide material with content
 *                 value:
 *                   success: true
 *                   data:
 *                     _id: "507f1f77bcf86cd799439011"
 *                     title: "Introduction to Algebra"
 *                     type: "slide"
 *                     order_num: 1
 *                     class_assign_id: "507f1f77bcf86cd799439012"
 *                     topic_id: "507f1f77bcf86cd799439013"
 *                     content_id: "507f1f77bcf86cd799439014"
 *                     status: "reviewed"
 *                     content:
 *                       _id: "507f1f77bcf86cd799439014"
 *                       title: "Introduction to Algebra"
 *                       pages: []
 *               quizExample:
 *                 summary: Quiz material with questions
 *                 value:
 *                   success: true
 *                   data:
 *                     _id: "507f1f77bcf86cd799439015"
 *                     title: "Algebra Quiz 1"
 *                     type: "quiz"
 *                     order_num: 2
 *                     class_assign_id: "507f1f77bcf86cd799439012"
 *                     content_id: "507f1f77bcf86cd799439016"
 *                     status: "published"
 *                     content:
 *                       _id: "507f1f77bcf86cd799439016"
 *                       title: "Algebra Quiz 1"
 *                       questions: []
 *               fileExample:
 *                 summary: File material with file entity
 *                 value:
 *                   success: true
 *                   data:
 *                     _id: "507f1f77bcf86cd799439017"
 *                     title: "Algebra Reference PDF"
 *                     type: "file"
 *                     order_num: 3
 *                     class_assign_id: "507f1f77bcf86cd799439012"
 *                     content_id: "507f1f77bcf86cd799439018"
 *                     status: "reviewed"
 *                     content:
 *                       _id: "507f1f77bcf86cd799439018"
 *                       filename: "algebra_reference.pdf"
 *                       url: "https://example.com/files/algebra_reference.pdf"
 *       404:
 *         description: Class material not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   put:
 *     tags:
 *       - ClassMaterials
 *     summary: Update a class material
 *     description: |
 *       [Teacher] Update material metadata and/or its content.
 *       The `dateUpdate` timestamp is automatically set by the backend.
 *       Status changes trigger automatic progress sync:
 *       - Changing from draft/deleted to published/reviewed creates progress records for all enrolled students.
 *       - Changing from published/reviewed to draft/deleted deletes all progress records for this material.
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class material ID to update
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ClassMaterialUpdateInput'
 *           example:
 *             title: "Updated Introduction to Algebra"
 *             topic_id: "507f1f77bcf86cd799439013"
 *             content_data:
 *               title: "Updated Introduction to Algebra"
 *               pages: []
 *     responses:
 *       200:
 *         description: Material updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClassMaterial'
 *       400:
 *         description: Validation error or invalid request data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - teacher role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Class material not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *   delete:
 *     tags:
 *       - ClassMaterials
 *     summary: Delete a class material
 *     description: "[Teacher] Delete a class material and its associated content permanently. All related progress records are automatically deleted."
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class material ID to delete
 *         example: "507f1f77bcf86cd799439011"
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
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - teacher role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Class material not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/class-materials/moderator/pending:
 *   get:
 *     tags:
 *       - ClassMaterials
 *     summary: Get pending materials for moderation
 *     description: "[Moderator] Retrieve all published (pending review) class materials."
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination (12 items per page)
 *         example: 1
 *     responses:
 *       200:
 *         description: Successfully retrieved pending materials
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ClassMaterial'
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - moderator role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/class-materials/{id}/status:
 *   patch:
 *     tags:
 *       - ClassMaterials
 *     summary: Change material status
 *     description: "[Moderator] Update the moderation status of a class material (e.g. published → reviewed)."
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class material ID
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChangeStatusInput'
 *           example:
 *             status: "reviewed"
 *     responses:
 *       200:
 *         description: Status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ClassMaterial'
 *       400:
 *         description: Invalid status value
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Invalid status value"
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - moderator role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Class material not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/class-materials/{id}/flag:
 *   patch:
 *     tags:
 *       - ClassMaterials
 *     summary: Flag a material for re-moderation
 *     description: "[Student] Flag a reviewed material for re-moderation. Only works on materials with status 'reviewed' and isFlaggable=true."
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class material ID to flag
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Material flagged successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ClassMaterial'
 *       400:
 *         description: Material cannot be flagged (wrong status, already flagged, or isFlaggable=false)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               notReviewed:
 *                 summary: Material is not reviewed
 *                 value:
 *                   message: "Only reviewed materials can be flagged"
 *               alreadyFlagged:
 *                 summary: Material already flagged
 *                 value:
 *                   message: "Material is already flagged"
 *               notFlaggable:
 *                 summary: Material cannot be flagged
 *                 value:
 *                   message: "This material has already been verified and cannot be flagged"
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Class material not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/class-materials/{id}/verify:
 *   patch:
 *     tags:
 *       - ClassMaterials
 *     summary: Re-verify a flagged material
 *     description: "[Moderator] Re-verify a student-flagged material. Sets status back to 'reviewed', clears the flag, and permanently disables further flagging (isFlaggable=false)."
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class material ID to verify
 *         example: "507f1f77bcf86cd799439011"
 *     responses:
 *       200:
 *         description: Material re-verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ClassMaterial'
 *       400:
 *         description: Material is not currently flagged
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Material is not currently flagged"
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - moderator role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Class material not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @openapi
 * /api/class-materials/{id}/toggle-ai:
 *   patch:
 *     tags:
 *       - ClassMaterials
 *     summary: Toggle AI material flag
 *     description: "[Teacher] Toggle whether a material is marked as AI-generated and optionally link AI content."
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Class material ID to update
 *         example: "507f1f77bcf86cd799439011"
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ToggleAiMaterialInput'
 *           example:
 *             ai_content_id: "507f1f77bcf86cd799439015"
 *     responses:
 *       200:
 *         description: AI flag toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "AI material flag toggled successfully"
 *                 is_ai_material:
 *                   type: boolean
 *                   example: true
 *                 ai_content_id:
 *                   type: string
 *                   nullable: true
 *                   example: "507f1f77bcf86cd799439015"
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - teacher role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Class material not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
