CREATE DATABASE `studentAttendanceTracker`;

USE studentAttendanceTracker;

CREATE TABLE admins (
	id INT PRIMARY KEY AUTO_INCREMENT,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    dob DATE NULL,
    organizationName VARCHAR(100) NULL,
    organizationCode INT NULL UNIQUE,
    shortName VARCHAR(10) NULL UNIQUE,
    secretCode VARCHAR(50) NULL UNIQUE,
	role ENUM('ADMIN','TEACHER'),
    gender VARCHAR(20) NOT NULL,
    
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NULL,
    
    accessToken VARCHAR(500) NULL,
    tokenExpiresAt DATETIME,
    
    class INT NULL,
	section VARCHAR(5) NULL,
	subject VARCHAR(20) NULL, 
      
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    
    adminId INT NULL,

    CONSTRAINT uq_admins_class_section UNIQUE (class, section, adminId),
  
    CONSTRAINT fk_admins_adminId
        FOREIGN KEY (adminId) REFERENCES admins(id)
);

CREATE TABLE students (
	id INT PRIMARY KEY AUTO_INCREMENT,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    dob DATE NULL,
    registerNumber INT NOT NULL,
    gender VARCHAR(20) NOT NULL,
    
    class INT NOT NULL,
	section VARCHAR(5) NOT NULL,
      
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    
    adminId INT NOT NULL,
    
    CONSTRAINT uq_students UNIQUE (registerNumber, adminId),

    CONSTRAINT fk_students_adminId
        FOREIGN KEY (adminId) REFERENCES admins(id)
);

CREATE TABLE attendance (
	id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    
    studentId INT NOT NULL,
    markedBy INT NOT NULL,
    status TINYINT NOT NULL DEFAULT 0,
    
    CONSTRAINT uq_attendance UNIQUE (date, studentId),
    
    CONSTRAINT fk_attendance_studentId
        FOREIGN KEY (studentId) REFERENCES students(id),
	
    CONSTRAINT fk_attendance_markedBy
        FOREIGN KEY (markedBy) REFERENCES admins(id)
);