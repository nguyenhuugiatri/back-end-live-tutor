'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Tutors', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
      },
      userId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
      },
      video: { type: Sequelize.STRING },
      bio: { type: Sequelize.TEXT },
      languages: { type: Sequelize.ARRAY(Sequelize.STRING) },
      specialties: { type: Sequelize.ARRAY(Sequelize.STRING) },
      resume: { type: Sequelize.TEXT },
      education: { type: Sequelize.TEXT },
      experience: { type: Sequelize.TEXT },
      accent: { type: Sequelize.STRING },
      targetStudent: { type: Sequelize.STRING },
      profession: { type: Sequelize.TEXT },
      interests: { type: Sequelize.TEXT },
      isActivated: {
        allowNull: false,
        type: Sequelize.BOOLEAN,
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
    await queryInterface.dropTable('Tutors');
  },
};
