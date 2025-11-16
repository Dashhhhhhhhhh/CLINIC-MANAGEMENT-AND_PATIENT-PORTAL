const sequelize = require("../../db");
const { DataTypes } = require("sequelize");

const Role = sequelize.define(
  "Role",
  {
    role_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    role_name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "roles",
    schema: "public",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

async function createRole(data) {
  return await Role.create({
    role_name: data.role_name,
    description: data.description,
    active: data.active ?? true,
  });
}

async function getAllRoles(active) {
  const where = {};
  if (typeof active === "boolean") where.active = active;

  return await Role.findAll({
    where,
    attributes: ["role_id", "role_name", "description", "active"],
    order: [["role_name", "ASC"]],
  });
}

async function getRoleById(id) {
  return await Role.findByPk(id, {
    attributes: ["role_id", "role_name", "description", "active"],
  });
}

async function updateRole(id, updateFields) {

  const [updatedCount] = await Role.update(updateFields, {
    where: { role_id: id },
  });

  if (!updatedCount) return null;

  return await Role.findByPk(id, {
    attributes: ["role_id", "role_name", "description", "active"],
  });
}

async function toggleStatusRole(id, activeStatus) {
  const role = await Role.findByPk(id);
  if (!role) return null;

  role.active = activeStatus;
  await role.save();
  return role;
}

module.exports = {
  Role,
  createRole,
  getAllRoles,
  getRoleById,
  updateRole,
  toggleStatusRole,
};
