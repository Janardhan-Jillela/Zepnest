-- ============================================================
-- Zepnest Service Request Application — Database Schema
-- Version: 2.0 (Production-Level)
-- Database: MySQL 8.0+ / TiDB Cloud Serverless
-- ============================================================

CREATE DATABASE IF NOT EXISTS zepnest_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE zepnest_db;

-- ============================================================
-- TABLE: users
-- Stores all registered users securely.
-- Passwords are ALWAYS bcrypt-hashed — never plain text.
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id            INT           NOT NULL AUTO_INCREMENT,
  full_name     VARCHAR(100)  NOT NULL                    COMMENT 'User display name',
  email         VARCHAR(150)  NOT NULL                    COMMENT 'Unique, stored lowercase',
  phone_number  VARCHAR(20)   DEFAULT NULL                COMMENT 'Optional contact number',
  password      VARCHAR(255)  NOT NULL                    COMMENT 'bcrypt hash — NEVER plain text',
  role          ENUM(
                  'customer',
                  'service_provider',
                  'admin'
                )             NOT NULL DEFAULT 'customer'  COMMENT 'Access level',
  is_active     TINYINT(1)    NOT NULL DEFAULT 1          COMMENT '0=deactivated, 1=active',
  last_login_at DATETIME      DEFAULT NULL                COMMENT 'Tracks most recent login',
  created_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE  KEY uq_users_email        (email),
  INDEX        idx_users_role        (role),
  INDEX        idx_users_is_active   (is_active),
  INDEX        idx_users_created_at  (created_at)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  COMMENT='Registered platform users — passwords are bcrypt hashed';


-- ============================================================
-- TABLE: service_requests
-- Each request belongs to one user (customer).
-- ============================================================
CREATE TABLE IF NOT EXISTS service_requests (
  id             INT           NOT NULL AUTO_INCREMENT,
  user_id        INT           NOT NULL                        COMMENT 'FK → users.id',
  title          VARCHAR(200)  NOT NULL,
  description    TEXT          NOT NULL,
  category       ENUM(
                   'cleaning',
                   'plumbing',
                   'electrical',
                   'carpentry',
                   'painting',
                   'other'
                 )             NOT NULL DEFAULT 'other',
  address        VARCHAR(500)  NOT NULL,
  preferred_time DATETIME      NOT NULL,
  status         ENUM(
                   'pending',
                   'in_progress',
                   'completed',
                   'cancelled'
                 )             NOT NULL DEFAULT 'pending',
  image_url      VARCHAR(500)  DEFAULT NULL,
  created_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at     TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  CONSTRAINT fk_requests_user
    FOREIGN KEY (user_id) REFERENCES users (id)
    ON DELETE CASCADE ON UPDATE CASCADE,

  INDEX idx_requests_user_id     (user_id),
  INDEX idx_requests_status      (status),
  INDEX idx_requests_category    (category),
  INDEX idx_requests_created_at  (created_at),
  INDEX idx_requests_preferred   (preferred_time),
  INDEX idx_requests_user_status (user_id, status),
  FULLTEXT INDEX ft_requests_search (title, description, address)

) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ============================================================
-- SEED DATA — Test Accounts
-- Password for all: "Test@1234" (bcrypt cost 12)
-- ============================================================
INSERT IGNORE INTO users (full_name, email, phone_number, password, role) VALUES
(
  'Admin User',
  'admin@zepnest.com',
  '+91 90000 00001',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5udem',
  'admin'
),
(
  'Jane Customer',
  'jane@example.com',
  '+91 98765 43210',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5udem',
  'customer'
),
(
  'John Provider',
  'john@example.com',
  '+91 98765 00000',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5udem',
  'service_provider'
);

-- Sample service requests
INSERT IGNORE INTO service_requests
  (user_id, title, description, category, address, preferred_time, status)
VALUES
(
  2,
  'Deep Clean 2BHK Apartment',
  'Need thorough deep cleaning of my 2BHK apartment including kitchen and bathrooms.',
  'cleaning',
  '42, MG Road, Koramangala, Bangalore - 560034',
  DATE_ADD(NOW(), INTERVAL 2 DAY),
  'pending'
),
(
  2,
  'Kitchen Sink Pipe Repair',
  'The pipe under the kitchen sink is leaking. Need a plumber ASAP.',
  'plumbing',
  '42, MG Road, Koramangala, Bangalore - 560034',
  DATE_ADD(NOW(), INTERVAL 1 DAY),
  'in_progress'
);
