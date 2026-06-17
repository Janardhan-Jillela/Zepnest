const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const User = require('./User');

const ServiceRequest = sequelize.define(
  'ServiceRequest',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    title: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: { notEmpty: true, len: [3, 200] },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: { notEmpty: true },
    },
    category: {
      type: DataTypes.ENUM('cleaning', 'plumbing', 'electrical', 'carpentry', 'painting', 'other'),
      allowNull: false,
      defaultValue: 'other',
    },
    address: {
      type: DataTypes.STRING(500),
      allowNull: false,
      validate: { notEmpty: true },
    },
    preferredTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'in_progress', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
    imageUrl: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    tableName: 'service_requests',
    indexes: [
      { fields: ['user_id'] },
      { fields: ['status'] },
      { fields: ['category'] },
      { fields: ['created_at'] },
    ],
  }
);

// Associations
User.hasMany(ServiceRequest, { foreignKey: 'userId', as: 'serviceRequests', onDelete: 'CASCADE' });
ServiceRequest.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = ServiceRequest;
