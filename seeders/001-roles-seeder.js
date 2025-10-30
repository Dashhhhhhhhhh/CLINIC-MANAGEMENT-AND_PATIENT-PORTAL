"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      { tableName: "roles", schema: "public" },
      [
        { role_name: "admin", description: "System administrator" },
        { role_name: "doctor", description: "Medical practitioner" },
        { role_name: "front desk", description: "Handles appointments and reception tasks" },
        { role_name: "staff", description: "General clinic staff (e.g., lab technician)" },
        { role_name: "patient", description: "Registered patient" },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      { tableName: "roles", schema: "public" },
      null,
      {}
    );
  },
};
