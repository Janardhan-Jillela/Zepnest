const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * User Model
 * Stores all registered users with hashed passwords, roles, and contact info.
 * Production-level: no plain-text passwords ever stored.
 */
const User = sequelize.define(
  'User',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      comment: 'Primary key — auto-incremented user ID',
    },
    fullName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'full_name',
      validate: {
        notEmpty: { msg: 'Full name cannot be empty.' },
        len: { args: [2, 100], msg: 'Name must be between 2 and 100 characters.' },
      },
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: { name: 'uq_users_email', msg: 'This email is already registered.' },
      validate: {
        isEmail: { msg: 'Must be a valid email address.' },
        notEmpty: { msg: 'Email cannot be empty.' },
      },
      set(value) {
        // Always store email in lowercase
        this.setDataValue('email', value?.toLowerCase().trim());
      },
    },
    phoneNumber: {
      type: DataTypes.STRING(20),
      allowNull: true,
      field: 'phone_number',
      validate: {
        is: {
          args: /^[+]?[\d\s\-().]{7,20}$/,
          msg: 'Must be a valid phone number.',
        },
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'bcrypt hashed password — never store plain text',
    },
    role: {
      type: DataTypes.ENUM('customer', 'service_provider', 'admin'),
      allowNull: false,
      defaultValue: 'customer',
      validate: {
        isIn: {
          args: [['customer', 'service_provider', 'admin']],
          msg: 'Role must be customer, service_provider, or admin.',
        },
      },
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      field: 'is_active',
      comment: 'Soft-disable accounts without deleting data',
    },
    lastLoginAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'last_login_at',
    },
  },
  {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    indexes: [
      { unique: true, fields: ['email'], name: 'uq_users_email' },
      { fields: ['role'], name: 'idx_users_role' },
      { fields: ['is_active'], name: 'idx_users_is_active' },
      { fields: ['created_at'], name: 'idx_users_created_at' },
    ],
    // Never expose password in JSON output
    defaultScope: {
      attributes: { exclude: ['password'] },
    },
    scopes: {
      withPassword: {
        attributes: { include: ['password'] },
      },
    },
  }
);

module.exports = User;
