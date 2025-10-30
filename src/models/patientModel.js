const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const { User } = require("./userModel");

const Patient = sequelize.define(
  "Patient",
  {
    patient_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    first_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    middle_initial: {
      type: DataTypes.STRING(5),
      allowNull: true,
    },
    last_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    birthdate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    contact_number: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    medical_history: {
      type: DataTypes.STRING(1000),
      allowNull: true,
    },
    conditions: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    building_number: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    street_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    barangay_subdivision: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    city_municipality: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    province: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    postal_code: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true, 
      references: {
        model: "users",
        key: "id",
      },
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "patients",
    schema: "users_table",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);




async function createPatient(data) {
  return await Patient.create({
    first_name: data.first_name.trim(),
    middle_initial: data.middle_initial ? data.middle_initial.trim() : null,
    last_name: data.last_name.trim(),
    birthdate: data.birthdate,
    contact_number: data.contact_number ? data.contact_number.trim() : null,
    medical_history: data.medical_history ? data.medical_history.trim() : null,
    building_number: data.building_number ? data.building_number.trim() : null,
    street_name: data.street_name ? data.street_name.trim() : null,
    barangay_subdivision: data.barangay_subdivision
      ? data.barangay_subdivision.trim()
      : null,
    city_municipality: data.city_municipality
      ? data.city_municipality.trim()
      : null,
    province: data.province ? data.province.trim() : null,
    postal_code: data.postal_code ? data.postal_code.trim() : null,
    country: data.country ? data.country.trim() : null,
    conditions: data.conditions || {},
    user_id: data.user_id || null,
    active: data.active ?? true,
  });
}

async function getAllPatients(active) {
  const where = {};
  if (typeof active === "boolean") where.active = active;

  return await Patient.findAll({
    where,
    include: [
      { model: User, as: "user", attributes: ["id", "email", "username"] },
    ],
    attributes: [
      "patient_id",
      "first_name",
      "middle_initial",
      "last_name",
      "birthdate",
      "contact_number",
      "medical_history",
      "building_number",
      "street_name",
      "barangay_subdivision",
      "city_municipality",
      "province",
      "postal_code",
      "country",
      "conditions",
      "active",
      "created_at",
      "updated_at",
    ],
    order: [["created_at", "DESC"]],
  });
}

async function getPatientById(patient_id) {
  return await Patient.findByPk(patient_id, {
    include: [
      { model: User, as: "user", attributes: ["id", "email", "username"] },
    ],
  });
}

async function updatePatient(patient_id, updateFields) {
  const [updatedCount] = await Patient.update(updateFields, {
    where: { patient_id },
  });

  if (!updatedCount) return null;

  return await Patient.findByPk(patient_id, {
    attributes: [
      "patient_id",
      "first_name",
      "middle_initial",
      "last_name",
      "birthdate",
      "contact_number",
      "medical_history",
      "building_number",
      "street_name",
      "barangay_subdivision",
      "city_municipality",
      "province",
      "postal_code",
      "country",
      "conditions",
      "active",
      "created_at",
      "updated_at",
    ],
    include: [
      { model: User, as: "user", attributes: ["id", "email", "username"] },
    ],
  });
}

async function togglePatientStatus(patient_id, activeStatus) {
  const patient = await Patient.findByPk(patient_id);
  if (!patient) return null;

  patient.active = activeStatus;
  await patient.save();
  return patient;
}

module.exports = {
  Patient,
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  togglePatientStatus,
};
