const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const { User } = require("../modules/users/user.model");
const { Role } = require("../models/roleModel");


const Admin = sequelize.define(
  "Admin",
  {
    admin_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    middle_initial: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    contact_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: true, 
    },
    role_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "admin",
    schema: "users_table",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);




async function createAdmin(data) {
  return await Admin.create({
    first_name: data.first_name,
    middle_initial: data.middle_initial,
    last_name: data.last_name,
    contact_number: data.contact_number,
    notes: data.notes,
    user_id: data.user_id,
    role_id: data.role_id,
    active: data.active ?? true,
  });
}

async function getAllAdmins(active, role_id) {
  const where = {};
  if (typeof active === "boolean") where.active = active;

  return await Admin.findAll({
    where,
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "email", "username", "role_id", "active"],
        include: [
          {
            model: Role,
            as: "role",
            attributes: ["role_id", "role_name", "description"],
          }
        ]
      },
    ],
    attributes: [
      "admin_id",
      "first_name",
      "middle_initial",
      "last_name",
      "contact_number",
      "notes",
      "active",
    ],
  });
}

async function getAdminById(id) {
  return await Admin.findByPk(id, {
    include: [
      {
        model: User,
        as: "user",
        attributes: ["id", "email", "username", "role_id", "active"],
        include:  [
          {
          model: Role,
          as: "role",
          attributes: ["role_id", "role_name", "description"],
          },
        ],
      },
    ],
  });
}

async function updateAdmin(id, updateFields) {
  const [updatedCount] = await Admin.update(updateFields, {
    where: { admin_id: id },
  });

  if (!updatedCount) return null;

  return await Admin.findByPk(id, {
    include: [{ model: User, as: "user" }],
  });
}

async function toggleAdminStatus(id, activeStatus) {
  const admin = await Admin.findByPk(id);
  if (!admin) return null;

  admin.active = activeStatus;
  await admin.save();
  return admin;
}

module.exports = {
  Admin,
  createAdmin,
  getAllAdmins,
  getAdminById,
  updateAdmin,
  toggleAdminStatus,
};
