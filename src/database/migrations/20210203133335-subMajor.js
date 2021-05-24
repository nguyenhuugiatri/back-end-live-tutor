'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('SubMajors', {
      id: {
        allowNull: false,
        autoIncrement: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      majorId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Majors',
          key: 'id',
        },
      },
      key: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      englishName: {
        type: Sequelize.TEXT,
      },
      vietnameseName: {
        type: Sequelize.TEXT,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  down: async (queryInterface) => {
    await queryInterface.dropTable('SubMajors');
  },
};