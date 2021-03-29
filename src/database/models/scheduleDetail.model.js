'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ScheduleDetail extends Model {
    static associate(models) {
      this.belongsTo(models.Schedule, {
        foreignKey: 'scheduleId',
        as: 'ScheduleInfo',
      });
    }
  }
  ScheduleDetail.init(
    {
      id: {
        allowNull: false,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        autoIncrement: false,
      },
      scheduleId: DataTypes.UUID,
      startPeriod: { type: DataTypes.DATE },
      endPeriod: { type: DataTypes.DATE },
      createdAt: { type: DataTypes.DATE, defaultValue: new Date() },
      updatedAt: { type: DataTypes.DATE, defaultValue: new Date() },
    },
    {
      sequelize,
      modelName: 'ScheduleDetail',
    },
  );
  return ScheduleDetail;
};