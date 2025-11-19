// models/associationModel.js

const { Doctor } = require("../modules/doctors/doctor.model");
const { Specialization } = require("../modules/specialization/specialization.model");
const { Patient } = require("../modules/patients/patients.model");
const { Position } = require("../modules/positions/position.model");
const { Staff } = require("../modules/staff/staff.model");
const { User } = require("../modules/users/user.model");
const { Role } = require("../modules/roles/roles.model");    
const { Hematology } = require("./hematologyModel");
const { Result } = require("./resultModel");
const { TestTypes } = require("./testTypesModel");
const { Urinalysis } = require("./urinalysisModel");
const { Xray } = require("./xrayModel");
const { Ultrasound } = require("./ultrasoundModel");
const { Billing } = require("../modules/billingMain/billingMain.model");
const { BillingItem } = require("../modules/billingItem/billingItem.model");
    
// 👆 You need this since you are referencing Role in multiple associations.

// 🩺 Doctor ↔ Specialization ↔ User
Specialization.hasMany(Doctor, { foreignKey: "specialization_id", as: "doctors" });
Doctor.belongsTo(Specialization, { foreignKey: "specialization_id", as: "specialization" });
Doctor.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasOne(Doctor, { foreignKey: "user_id", as: "doctor" });

// 👩‍⚕️ Staff ↔ Position ↔ User
Position.hasMany(Staff, { foreignKey: "position_id", as: "staff" });
Staff.belongsTo(Position, { foreignKey: "position_id", as: "position" });
Staff.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasOne(Staff, { foreignKey: "user_id", as: "staff" });

// 🧍 Patient ↔ User
Patient.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasOne(Patient, { foreignKey: "user_id", as: "patient" });

// 👥 User ↔ Role
User.belongsTo(Role, { foreignKey: "role_id", as: "role" });
Role.hasMany(User, { foreignKey: "role_id", as: "users" });

// 🩸Hematology ↔  Result
Result.hasOne(Hematology, { foreignKey: "result_id", as: "hematology" });
Hematology.belongsTo(Result, { foreignKey: "result_id" });

// 🧍‍ Patient ↔ Results
Patient.hasMany(Result, { foreignKey: "patient_id", as: "results" });
Result.belongsTo(Patient, { foreignKey: "patient_id", as: "patient" });

// 👩‍⚕️ Staff ↔ Results
Staff.hasMany(Result, { as: "CreatedResults", foreignKey: "created_by" });
Result.belongsTo(Staff, { as: "Creator", foreignKey: "created_by" });

// 👨‍⚕️ Doctor ↔ Results (initial_by)
Staff.hasMany(Result, { as: "InitialResults", foreignKey: "initial_result_by" });
Result.belongsTo(Staff, { as: "initialMedTech", foreignKey: "initial_result_by" });

// 👨‍⚕️ staff ↔ Results (approved_by)
Staff.hasMany(Result, { as: "FinalResults", foreignKey: "final_result_by" });
Result.belongsTo(Staff, { as: "finalMedTech", foreignKey: "final_result_by" });

// dataTypes ↔ Results
TestTypes.hasMany(Result, { foreignKey: "test_type_id" });
Result.belongsTo(TestTypes, { foreignKey: "test_type_id" });

// Urinalysis ↔ Results
Result.hasOne(Urinalysis, { foreignKey: "result_id", as: "urinalysis" });
Urinalysis.belongsTo(Result, { foreignKey: "result_id" });

// Xray ↔ Results
Result.hasOne(Xray, { foreignKey: "result_id", as: "xray" });
Xray.belongsTo(Result, { foreignKey: "result_id" });

//Ultrasound ↔ Results
Result.hasOne(Ultrasound, { foreignKey: "result_id" });
Ultrasound.belongsTo(Result, { foreignKey: "result_id" });

//BillingMain ↔ Patient

Billing.belongsTo(Patient, {foreignKey: "patient_id" });
Patient.hasMany(Billing, {foreignKey: "patient_id" });

//BillingMain ↔ Staff

Staff.hasMany(Billing, {foreignKey: "created_by" });
Billing.belongsTo(Staff, {foreignKey: "created_by" });

//BillingItem ↔ Billing

BillingItem.hasMany(BillingItem, {foreignKey: "billing_id", as: "items"});
BillingItem.belongsTo(Billing, {foreignKey: "billing_id", as: "billing"});