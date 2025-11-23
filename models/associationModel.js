// models/associationModel.js

const { Doctor } = require("../modules/doctors/doctor.model");
const { Specialization } = require("../modules/specialization/specialization.model");
const { Patient } = require("../modules/patients/patients.model");
const { Position } = require("../modules/positions/position.model");
const { Staff } = require("../modules/staff/staff.model");
const { User } = require("../modules/users/user.model");
const { Role } = require("../modules/roles/roles.model");    
const { Hematology } = require("./hematologyModel");
const { Result } = require("../modules/results/result.model");
const { TestTypes } = require("../modules/testTypes/testTypes.model");
const { Urinalysis } = require("./urinalysisModel");
const { Xray } = require("./xrayModel");
const { Ultrasound } = require("./ultrasoundModel");
const { Billing } = require("../modules/billingMain/billingMain.model");
const { BillingItem } = require("../modules/billingItem/billingItem.model");
const { BillingService } = require("../modules/billingService/billingService.model");

/* ============================================================
   USER / ROLE / STAFF / DOCTOR / PATIENT RELATIONSHIPS
   ============================================================ */

// Role ↔ Users
User.belongsTo(Role, { foreignKey: "role_id", as: "role" });
Role.hasMany(User, { foreignKey: "role_id", as: "users" });

// User ↔ Staff
Staff.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasOne(Staff, { foreignKey: "user_id", as: "staff" });

// User ↔ Doctor
Doctor.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasOne(Doctor, { foreignKey: "user_id", as: "doctor" });

// User ↔ Patient
Patient.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasOne(Patient, { foreignKey: "user_id", as: "patient" });

// Staff ↔ Position
Position.hasMany(Staff, { foreignKey: "position_id", as: "staff" });
Staff.belongsTo(Position, { foreignKey: "position_id", as: "position" });

// Doctor ↔ Specialization
Specialization.hasMany(Doctor, { foreignKey: "specialization_id", as: "doctors" });
Doctor.belongsTo(Specialization, { foreignKey: "specialization_id", as: "specialization" });

/* ============================================================
   RESULT RELATIONSHIPS
   ============================================================ */

// Result ↔ Patient
Patient.hasMany(Result, { foreignKey: "patient_id", as: "results" });
Result.belongsTo(Patient, { foreignKey: "patient_id", as: "patient" });

// created_by (Staff who created the result)
Staff.hasMany(Result, { as: "CreatedResults", foreignKey: "created_by" });
Result.belongsTo(Staff, { as: "Creator", foreignKey: "created_by" });

// initial_result_by (initial medtech)
Staff.hasMany(Result, { as: "InitialResults", foreignKey: "initial_result_by" });
Result.belongsTo(Staff, { as: "initialMedTech", foreignKey: "initial_result_by" });

// final_result_by (final medtech / approver)
Staff.hasMany(Result, { as: "FinalResults", foreignKey: "final_result_by" });
Result.belongsTo(Staff, { as: "finalMedTech", foreignKey: "final_result_by" });

// Result ↔ Test Types
TestTypes.hasMany(Result, { foreignKey: "test_type_id" });
Result.belongsTo(TestTypes, { foreignKey: "test_type_id" });

// Result ↔ Billing Item
Result.belongsTo(BillingItem, { foreignKey: "billing_item_id", as: "billingItem" });

/* ============================================================
   RESULT SUB-TABLES (Hematology, Urinalysis, Xray, Ultrasound)
   ============================================================ */

Result.hasOne(Hematology, { foreignKey: "result_id", as: "hematology" });
Hematology.belongsTo(Result, { foreignKey: "result_id" });

Result.hasOne(Urinalysis, { foreignKey: "result_id", as: "urinalysis" });
Urinalysis.belongsTo(Result, { foreignKey: "result_id" });

Result.hasOne(Xray, { foreignKey: "result_id", as: "xray" });
Xray.belongsTo(Result, { foreignKey: "result_id" });

Result.hasOne(Ultrasound, { foreignKey: "result_id", as: "ultrasound" });
Ultrasound.belongsTo(Result, { foreignKey: "result_id" });

/* ============================================================
   BILLING RELATIONSHIPS
   ============================================================ */

// Billing ↔ Patient
Billing.belongsTo(Patient, { foreignKey: "patient_id" });
Patient.hasMany(Billing, { foreignKey: "patient_id" });

// Billing ↔ Staff
Staff.hasMany(Billing, { foreignKey: "created_by" });
Billing.belongsTo(Staff, { foreignKey: "created_by" });

// BillingItem ↔ Billing / BillingService / Staff
BillingItem.belongsTo(Billing, { foreignKey: "billing_id", as: "billing" });
BillingItem.belongsTo(BillingService, { foreignKey: "service_id", as: "service" });
BillingItem.belongsTo(Staff, { foreignKey: "created_by", as: "creator" });

