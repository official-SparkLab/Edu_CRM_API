

-- CRM SQL Schema
-- Drop tables if they exist (to avoid errors on re-run)
-- DROP TABLE IF EXISTS tbl_course;
-- DROP TABLE IF EXISTS tbl_section;
-- DROP TABLE IF EXISTS tbl_branch;
-- DROP TABLE IF EXISTS tbl_institute;
-- DROP TABLE IF EXISTS tbl_registration;

-- User/Registration Table
CREATE TABLE IF NOT EXISTS tbl_registration (
  reg_id INT AUTO_INCREMENT PRIMARY KEY,
  user_name VARCHAR(255) NOT NULL,
  contact BIGINT(12) NOT NULL UNIQUE,
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255) NOT NULL,
  branch_id INT,					-- FK to be added later
  role INT NOT NULL,
  status INT DEFAULT 1,
  added_by INT,						-- FK to self, will be added later
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Branch Table
CREATE TABLE IF NOT EXISTS tbl_branch (
  branch_id INT AUTO_INCREMENT PRIMARY KEY,
  branch_name VARCHAR(255) NOT NULL,
  branch_code VARCHAR(255),
  institute_name VARCHAR(500),
  email VARCHAR(255) NOT NULL UNIQUE,
  phone BIGINT(12) NOT NULL UNIQUE,
  alternative_phone BIGINT(12),
  address TEXT NOT NULL,
  district VARCHAR(255),
  state VARCHAR(255),
  pincode VARCHAR(100) NOT NULL,
  established_date DATE NOT NULL,
  status INT DEFAULT 1,
  added_by INT,						-- FK to registration, will add later
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- Add FKs after both tables are created

-- Add FK branch_id in tbl_registration
ALTER TABLE tbl_registration
ADD CONSTRAINT fk_registration_branch
FOREIGN KEY (branch_id) REFERENCES tbl_branch(branch_id)
ON UPDATE CASCADE ON DELETE SET NULL;

-- Add FK added_by in tbl_registration (self-reference)
ALTER TABLE tbl_registration
ADD CONSTRAINT fk_registration_added_by
FOREIGN KEY (added_by) REFERENCES tbl_registration(reg_id)
ON UPDATE CASCADE ON DELETE SET NULL;

-- Add FK added_by in tbl_branch
ALTER TABLE tbl_branch
ADD CONSTRAINT fk_branch_added_by
FOREIGN KEY (added_by) REFERENCES tbl_registration(reg_id)
ON UPDATE CASCADE ON DELETE SET NULL;



-- Institute Table
CREATE TABLE IF NOT EXISTS tbl_institute (
  institute_id INT AUTO_INCREMENT PRIMARY KEY,
  institute_name VARCHAR(500) NOT NULL,
  registration_no VARCHAR(255) NOT NULL,
  gst_no VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_no BIGINT(12) NOT NULL,
  alternative_phone BIGINT(12),
  address TEXT NOT NULL,
  dist VARCHAR(255),
  state VARCHAR(255),
  pincode VARCHAR(100) NOT NULL,
  logo TEXT,
  established_year DATE NOT NULL,
  director_name VARCHAR(255) NOT NULL,
  status INT DEFAULT 1,
  added_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_institute_added_by FOREIGN KEY (added_by) REFERENCES tbl_registration(reg_id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Section Table
CREATE TABLE IF NOT EXISTS tbl_section (
  section_id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  code VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status INT DEFAULT 1,
  added_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_section_added_by FOREIGN KEY (added_by) REFERENCES tbl_registration(reg_id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Course Table
CREATE TABLE IF NOT EXISTS tbl_course (
  course_id INT AUTO_INCREMENT PRIMARY KEY,
  course_name VARCHAR(255) NOT NULL,
  course_code VARCHAR(255) NOT NULL,
  duration VARCHAR(255) NOT NULL,
  fees INT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  certificate_offered VARCHAR(255) NOT NULL,
  status INT DEFAULT 1,
  branch_id INT,
  added_by INT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_course_branch FOREIGN KEY (branch_id) REFERENCES tbl_branch(branch_id) ON UPDATE CASCADE ON DELETE SET NULL,
  CONSTRAINT fk_course_added_by FOREIGN KEY (added_by) REFERENCES tbl_registration(reg_id) ON UPDATE CASCADE ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4; 