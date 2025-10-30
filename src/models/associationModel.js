// models/associationModel.js

const { Doctor } = require("./doctorModel");
const { Specialization } = require("./specializationModel");
const { Admin } = require("./adminModel");
const { Patient } = require("./patientModel");
const { Position } = require("./positionModel");
const { Staff } = require("./staffModel");
const { User } = require("./userModel");
const { Role } = require("./roleModel");
const { Hematology } = require("./hematologyModel");
const { Result } = require("./resultModel");
const { TestTypes } = require("./testTypesModel");
const { Urinalysis } = require("./urinalysisModel");
const { Xray } = require("./xrayModel");
const { Ultrasound } = require("./ultrasoundModel");
const { Billing } = require("../billing/billingMainModel");
const { BillingItem } = require("../billing/billingItemModel");
const { BillingService } = require("../billing/billingServiceModel");

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

// 🧑‍💼 Admin ↔ Role ↔ User
Admin.belongsTo(Role, { foreignKey: "role_id", as: "role" });
Admin.belongsTo(User, { foreignKey: "user_id", as: "user" });
User.hasOne(Admin, { foreignKey: "user_id", as: "admin" });

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

//Billing ↔ Patients
Patient.hasMany(Billing, { foreignKey: "patient_id", as: "billings" });
Billing.belongsTo(Patient, {foreignKey: "patient_id", as: "patient" });

//Billing ↔ Billing Items
Billing.hasMany(BillingItem, { foreignKey: "billing_id", as: "items", onDelete: "CASCADE" });
BillingItem.belongsTo(Billing, { foreignKey: "billing_id", as: "billing" });

//Billing Items ↔ Billing Service
BillingItem.belongsTo(BillingService, { foreignKey: "service_id", as: "service" });
BillingService.hasMany(BillingItem, { foreignKey: "service_id", as: "items" });

// BillingItem ↔ Result
BillingItem.hasOne(Result, { foreignKey: "billing_item_id", as: "result" });
Result.belongsTo(BillingItem, { foreignKey: "billing_item_id", as: "billing_item" });


// Billing - Staff
Billing.belongsTo(Staff, { foreignKey: "finalized_by", as: "finalizedByStaff" });
Billing.belongsTo(Staff, { foreignKey: "updated_by", as: "updatedByStaff" });
Billing.belongsTo(Staff, { foreignKey: "created_by", as: "createdByStaff" });
