const sequelize = require("../../db");
const { DataTypes } = require("sequelize");

const Position = sequelize.define(
  "Position",
  {
    position_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    position_name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: "position",
    schema: "public",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);


async function createPosition(data) {
  return await Position.create({
    position_name: data.position_name,
    active: data.active ?? true,
  });
}

async function getAllPositions(active) {
  const where = {};
  if (typeof active === "boolean") where.active = active;

  return await Position.findAll({
    where,
    attributes: ["position_id", "position_name", "active"],
    order: [["position_name", "ASC"]],
  });
}

async function getPositionById(id) {
  return await Position.findByPk(id, {
    attributes: ["position_id", "position_name", "active"],
  });
}

async function updatePosition(id, updateFields) {
  const [updatedCount] = await Position.update(updateFields, {
    where: { position_id: id },
  });

  if (!updatedCount) return null;
  return await Position.findByPk(id, {
    attributes: ["position_id", "position_name", "active"],
  });
}

async function togglePositionStatus(id, activeStatus) {
  const position = await Position.findByPk(id);
  if (!position) return null;

  position.active = activeStatus;
  await position.save();
  return position;
}

module.exports = {
  Position,
  createPosition,
  getAllPositions,
  getPositionById,
  updatePosition,
  togglePositionStatus,
};