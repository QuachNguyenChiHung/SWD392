DECLARE @sql NVARCHAR(MAX) = N'';

SELECT @sql += 'ALTER TABLE ' + QUOTENAME(OBJECT_SCHEMA_NAME(parent_object_id))
    + '.' + QUOTENAME(OBJECT_NAME(parent_object_id)) 
    + ' DROP CONSTRAINT ' + QUOTENAME(name) + ';'
FROM sys.foreign_keys;

EXEC sp_executesql @sql;

-- Drop tables in any order (no FK constraints exist now)
IF OBJECT_ID('result', 'U') IS NOT NULL DROP TABLE result;
IF OBJECT_ID('question', 'U') IS NOT NULL DROP TABLE question;
IF OBJECT_ID('quiz_attempt', 'U') IS NOT NULL DROP TABLE quiz_attempt;
IF OBJECT_ID('feedback', 'U') IS NOT NULL DROP TABLE feedback;
IF OBJECT_ID('progress_classmaterial', 'U') IS NOT NULL DROP TABLE progress_classmaterial;
IF OBJECT_ID('quiz', 'U') IS NOT NULL DROP TABLE quiz;
IF OBJECT_ID('slide', 'U') IS NOT NULL DROP TABLE slide;
IF OBJECT_ID('2d_render', 'U') IS NOT NULL DROP TABLE [2d_render];
IF OBJECT_ID('file', 'U') IS NOT NULL DROP TABLE [file];
IF OBJECT_ID('class_material', 'U') IS NOT NULL DROP TABLE class_material;
IF OBJECT_ID('ai_content', 'U') IS NOT NULL DROP TABLE ai_content;
IF OBJECT_ID('ai_request', 'U') IS NOT NULL DROP TABLE ai_request;
IF OBJECT_ID('topic', 'U') IS NOT NULL DROP TABLE topic;
IF OBJECT_ID('enroll', 'U') IS NOT NULL DROP TABLE enroll;
IF OBJECT_ID('class', 'U') IS NOT NULL DROP TABLE class;
IF OBJECT_ID('course', 'U') IS NOT NULL DROP TABLE course;
IF OBJECT_ID('log', 'U') IS NOT NULL DROP TABLE log;
IF OBJECT_ID('admin', 'U') IS NOT NULL DROP TABLE admin;
IF OBJECT_ID('teacher', 'U') IS NOT NULL DROP TABLE teacher;
IF OBJECT_ID('user', 'U') IS NOT NULL DROP TABLE [user];

-- ============================================================================
-- Core User Tables
-- ============================================================================

CREATE TABLE [user] (
    user_id INT PRIMARY KEY IDENTITY(1,1),
    roles NVARCHAR(255) NOT NULL,
    username NVARCHAR(100) NOT NULL UNIQUE,
    email NVARCHAR(255) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL,
    name NVARCHAR(255) NOT NULL,
    date_create DATETIME2 NOT NULL DEFAULT GETDATE(),
    status BIT NOT NULL DEFAULT 1
);


CREATE TABLE teacher (
    teacher_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL UNIQUE,
    credential NVARCHAR(500),
    date_create DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT fk_teacher_user FOREIGN KEY (user_id) 
        REFERENCES [user](user_id) ON DELETE NO ACTION
);


CREATE TABLE admin (
    admin_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL UNIQUE,
    authorization_lvl INT NOT NULL,
    status BIT NOT NULL DEFAULT 1,
    date_create DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT fk_admin_user FOREIGN KEY (user_id) 
        REFERENCES [user](user_id) ON DELETE NO ACTION
);


CREATE TABLE log (
    log_id INT PRIMARY KEY IDENTITY(1,1),
    admin_id INT NOT NULL,
    action NVARCHAR(255) NOT NULL,
    action_type NVARCHAR(100) NOT NULL,
    status NVARCHAR(50) NOT NULL,
    CONSTRAINT fk_log_admin FOREIGN KEY (admin_id) 
        REFERENCES admin(admin_id) ON DELETE CASCADE
);


-- ============================================================================
-- Course & Class Tables
-- ============================================================================

CREATE TABLE course (
    course_id INT PRIMARY KEY IDENTITY(1,1),
    course_name NVARCHAR(255) NOT NULL,
    grade_level NVARCHAR(50) NOT NULL,
    change_log NVARCHAR(MAX),/*json*/
    date_create DATETIME2 NOT NULL DEFAULT GETDATE(),
    status BIT NOT NULL DEFAULT 1
);


CREATE TABLE class (
    class_id INT PRIMARY KEY IDENTITY(1,1),
    keypass NVARCHAR(100) NOT NULL UNIQUE,
    course_id INT,
    teacher_id INT NOT NULL,
    class_name NVARCHAR(255) NOT NULL,
    img_cover_link NVARCHAR(500),
    keywords NVARCHAR(500),
    date_create DATETIME2 NOT NULL DEFAULT GETDATE(),
    status BIT NOT NULL DEFAULT 1,
    CONSTRAINT fk_class_course FOREIGN KEY (course_id) 
        REFERENCES course(course_id) ON DELETE SET NULL,
    CONSTRAINT fk_class_teacher FOREIGN KEY (teacher_id) 
        REFERENCES teacher(teacher_id) ON DELETE NO ACTION
);


CREATE TABLE enroll (
    enroll_id INT PRIMARY KEY IDENTITY(1,1),
    class_id INT,
    student_id INT,
    date_join DATETIME2 NOT NULL DEFAULT GETDATE(),
    status BIT NOT NULL DEFAULT 1,
    date_end DATETIME2,
    CONSTRAINT fk_enroll_class FOREIGN KEY (class_id) 
        REFERENCES class(class_id) ON DELETE SET NULL,
    CONSTRAINT fk_enroll_user FOREIGN KEY (student_id) 
        REFERENCES [user](user_id) ON DELETE NO ACTION
);


CREATE TABLE topic (
    topic_id INT PRIMARY KEY IDENTITY(1,1),
    course_id INT NOT NULL,
    title NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    CONSTRAINT fk_topic_course FOREIGN KEY (course_id) 
        REFERENCES course(course_id) ON DELETE CASCADE
);


-- ============================================================================
-- AI Request & Content Tables
-- ============================================================================

CREATE TABLE ai_request (
    ai_request_id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT,
    prompt NVARCHAR(MAX) NOT NULL,
    type NVARCHAR(100) NOT NULL,
    date DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT fk_ai_request_user FOREIGN KEY (user_id) 
        REFERENCES [user](user_id) ON DELETE SET NULL
);


CREATE TABLE ai_content (
    ai_content_id INT PRIMARY KEY IDENTITY(1,1),
    ai_request_id INT NOT NULL,
    review_status NVARCHAR(50) NOT NULL,
    content_type NVARCHAR(100) NOT NULL,
    record_json NVARCHAR(MAX) NOT NULL,/*json*/
    CONSTRAINT fk_ai_content_request FOREIGN KEY (ai_request_id) 
        REFERENCES ai_request(ai_request_id) ON DELETE CASCADE
);


-- ============================================================================
-- Class Material Table
-- ============================================================================

CREATE TABLE class_material (
    material_id INT PRIMARY KEY IDENTITY(1,1),
    topic_id INT,
    type NVARCHAR(50) NOT NULL CHECK (type IN ('file', 'slide', '2d_render', 'quiz')),
    order_num INT NOT NULL,
    class_assign_id INT NOT NULL,
    title NVARCHAR(255) NOT NULL,
    dateUpdate DATETIME2,
    dateCreate DATETIME2 NOT NULL DEFAULT GETDATE(),
    content_id INT,
    is_ai_material BIT NOT NULL DEFAULT 0,
    ai_content_id INT UNIQUE,
    CONSTRAINT fk_class_material_topic FOREIGN KEY (topic_id) 
        REFERENCES topic(topic_id) ON DELETE SET NULL,
    CONSTRAINT fk_class_material_class FOREIGN KEY (class_assign_id) 
        REFERENCES class(class_id) ON DELETE CASCADE,
    CONSTRAINT fk_class_material_ai_content FOREIGN KEY (ai_content_id) 
        REFERENCES ai_content(ai_content_id) ON DELETE SET NULL
);


-- ============================================================================
-- Material Support Tables (1-to-1 with class_material)
-- ============================================================================

CREATE TABLE [file] (
    file_id INT PRIMARY KEY,
    file_name NVARCHAR(255) NOT NULL,
    file_path NVARCHAR(500) NOT NULL,
    CONSTRAINT fk_file_material FOREIGN KEY (file_id) 
        REFERENCES class_material(material_id) ON DELETE CASCADE
);

CREATE TABLE [2d_render] (
    render_id INT PRIMARY KEY,
    render_data NVARCHAR(MAX) NOT NULL,/*json*/
    CONSTRAINT fk_2d_render_material FOREIGN KEY (render_id) 
        REFERENCES class_material(material_id) ON DELETE CASCADE
);

CREATE TABLE slide (
    slide_id INT PRIMARY KEY,
    slide_name NVARCHAR(255) NOT NULL,
    file_path NVARCHAR(500) NOT NULL,
    CONSTRAINT fk_slide_material FOREIGN KEY (slide_id) 
        REFERENCES class_material(material_id) ON DELETE CASCADE
);

-- ============================================================================
-- Quiz Tables
-- ============================================================================

CREATE TABLE quiz (
    quiz_id INT PRIMARY KEY IDENTITY(1,1),
    material_id INT NOT NULL UNIQUE,
    title NVARCHAR(255) NOT NULL,
    keyword NVARCHAR(500),
    type NVARCHAR(50) NOT NULL,
    available_date DATETIME2,
    max_attempt_number INT,
    end_date DATETIME2,
    status BIT NOT NULL DEFAULT 1,
    CONSTRAINT fk_quiz_material FOREIGN KEY (material_id) 
        REFERENCES class_material(material_id) ON DELETE CASCADE
);


CREATE TABLE question (
    question_id INT PRIMARY KEY IDENTITY(1,1),
    quiz_id INT NOT NULL,
    options NVARCHAR(MAX) NOT NULL, /*json because it is array*/
    correct_index INT NOT NULL,
    CONSTRAINT fk_question_quiz FOREIGN KEY (quiz_id) 
        REFERENCES quiz(quiz_id) ON DELETE CASCADE
);


CREATE TABLE quiz_attempt (
    attempt_id INT PRIMARY KEY IDENTITY(1,1),
    quiz_id INT,
    user_id INT NOT NULL,
    attempt_number INT NOT NULL,
    date DATETIME2 NOT NULL DEFAULT GETDATE(),
    record_json NVARCHAR(MAX),/*json*/
    CONSTRAINT fk_quiz_attempt_quiz FOREIGN KEY (quiz_id) 
        REFERENCES quiz(quiz_id) ON DELETE SET NULL,
    CONSTRAINT fk_quiz_attempt_user FOREIGN KEY (user_id) 
        REFERENCES [user](user_id) ON DELETE NO ACTION
);

CREATE TABLE result (
    result_id INT PRIMARY KEY IDENTITY(1,1),
    quiz_attempt_id INT NOT NULL,
    text NVARCHAR(MAX),
    options NVARCHAR(MAX),/*json*/
    options_picked_index int,
    isCorrect BIT NOT NULL,
    CONSTRAINT fk_result_attempt FOREIGN KEY (quiz_attempt_id) 
        REFERENCES quiz_attempt(attempt_id) ON DELETE CASCADE
);


-- ============================================================================
-- Progress & Feedback Tables
-- ============================================================================

CREATE TABLE progress_classmaterial (
    progress_id INT PRIMARY KEY IDENTITY(1,1),
    enroll_id INT NOT NULL,
    classmaterial_id INT,
    completion_status NVARCHAR(50) NOT NULL,
    date_completed DATETIME2,
    CONSTRAINT fk_progress_enroll FOREIGN KEY (enroll_id) 
        REFERENCES enroll(enroll_id) ON DELETE CASCADE,
    CONSTRAINT fk_progress_material FOREIGN KEY (classmaterial_id) 
        REFERENCES class_material(material_id) ON DELETE SET NULL
);

CREATE TABLE feedback (
    feedback_id INT PRIMARY KEY IDENTITY(1,1),
    material_id INT,
    user_id INT NOT NULL,
    rating INT,
    comment NVARCHAR(MAX),
    date DATETIME2 NOT NULL DEFAULT GETDATE(),
    CONSTRAINT fk_feedback_material FOREIGN KEY (material_id) 
        REFERENCES class_material(material_id) ON DELETE SET NULL,
    CONSTRAINT fk_feedback_user FOREIGN KEY (user_id) 
        REFERENCES [user](user_id) ON DELETE NO ACTION
);
