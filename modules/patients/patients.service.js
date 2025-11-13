const { isValidUUID } = require("../../utils/security");
const { Patient, createPatient, getAllPatients, getPatientById, updatePatient, togglePatientStatus} = require("../patients/patients.models");