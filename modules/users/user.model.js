const { DataTypes } = require("sequelize");
const sequelize = require("../../db");
const { comparePassword } = require("../../utils/security");
const { Role } = require("../roles/roles.model");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    role_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: { tableName: "roles", schema: "public" },
        key: "role_id",
      }
    },
    gender: {
      type: DataTypes.ENUM("male", "female"),
      allowNull: true,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "users",
    schema: "users_table",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

async function createUser(data) {
  return await User.create({
    email: data.email.trim(),
    username: data.username.trim(),
    password_hash: data.password_hash,
    gender: data.gender,
    role_id: data.role_id,
    active: data.active ?? true,
  });
}

async function loginUser(email, password) {
  const user = await user.findOne({ where : {email } });
  if (!user) return null;

  const isPasswordValid = await comparePassword(password, user.password_hash);
  if (!isPasswordValid) return null;

  return user;
}

async function getAllUsers(active, role_id) {
  const where = {};
  if (typeof active === "boolean") where.active = active;
  if (role_id) where.role_id = role_id;

  return await User.findAll({
    where,
    include: [{ model: Role, as: "role", attributes: ["role_name"] }],
    attributes: ["id", "email", "username", "active", "created_at", "updated_at"],
    order: [["created_at", "DESC"]],
  });
}

async function getUserById(id) {
  return await User.findByPk(id, {
    include: [{ model: Role, as: "role", attributes: ["role_name"] }],
  });
}

async function updateUser(id, updateFields) {
  const [updatedCount] = await User.update(updateFields, {
    where: { id },
  });
  if (!updatedCount) return null;

  return await User.findByPk(id, {
    attributes: ["id", "email", "username", "role_id", "active"],
    include: [{ model: Role, as: "role", attributes: ["role_name"] }],
  });
}

async function toggleUserStatus(id, activeStatus) {
  const user = await User.findByPk(id);
  if (!user) return null;

  user.active = activeStatus;
  await user.save();
  return user;
}

module.exports = {
  User,
  createUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  toggleUserStatus,
};
