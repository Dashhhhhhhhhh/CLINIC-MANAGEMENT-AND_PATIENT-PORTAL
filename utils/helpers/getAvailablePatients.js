const { Patient } = require('../../modules/patients/patients.model');
const { Billing } = require('../../modules/billingMain/billingMain.model');
const { Op } = require('sequelize');

async function getAvailablePatientsByModel(Model) {
  try {
    const assignedPatientIDs = await Model.findAll({ attributes: ['patient_id'], raw: true });
    let patientIds = assignedPatientIDs.map(patient => patient.patient_id);

    patientIds = patientIds.filter(id => id !== null && id !== undefined);

    patientIds = [...new Set(patientIds)];

    let whereCondition = {};

    if (patientIds.length !== 0) {
      whereCondition = { patient_id: { [Op.notIn]: patientIds } };
    }

    const availablePatients = await Patient.findAll({ where: whereCondition });

    return {
      success: true,
      patients: availablePatients,
    };
  } catch (error) {
    console.error('getAvailablePatients error:', error);
    throw error;
  }
}

module.exports = { getAvailablePatientsByModel };
