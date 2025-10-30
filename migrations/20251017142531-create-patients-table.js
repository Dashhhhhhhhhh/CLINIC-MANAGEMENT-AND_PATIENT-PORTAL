'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createSchema('users_table');

    await queryInterface.createTable(
      { tableName: 'patients', schema: 'users_table' },
      {
        patient_id: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.literal('gen_random_uuid()'),
          primaryKey: true,
        },
        first_name: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        middle_initial: {
          type: Sequelize.STRING(5),
          allowNull: true,
        },
        last_name: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        birthdate: {
          type: Sequelize.DATEONLY,
          allowNull: false,
        },
        contact_number: {
          type: Sequelize.STRING(20),
          allowNull: true,
        },
        medical_history: {
          type: Sequelize.STRING(1000),
          allowNull: true,
        },
        conditions: {
          type: Sequelize.JSONB,
          allowNull: true,
        },
        building_number: {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
        street_name: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        barangay_subdivision: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        city_municipality: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        province: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        postal_code: {
          type: Sequelize.STRING(20),
          allowNull: false,
        },
        country: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        user_id: {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: {
              tableName: 'users',
              schema: 'users_table',
            },
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'SET NULL',
        },
        active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        created_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updated_at: {
          type: Sequelize.DATE,
          allowNull: false,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable({ tableName: 'patients', schema: 'users_table' });
    await queryInterface.dropSchema('users_table');
  },
};

