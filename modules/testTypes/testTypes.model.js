const { DataTypes } = require("sequelize");
const sequelize = require("../../db");

const TestTypes = sequelize.define(
    "TestTypes",
    {
        test_type_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey:true
        },
        test_type_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        },
    },
    {
        tableName: "test_types",
        schema: "lab_results",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
    }
);

async function createTestTypes(data) {
    
    return await TestTypes.create({
        test_type_name: data.test_type_name,
        description: data.description,
        active: data.active ?? true,
    });
}

async function getAllTestTypes(active) {
    
    const where = {};
    if (typeof active === "boolean" ) where.active = active;

    return await TestTypes.findAll({
        where,
        attributes: ["test_type_id", "test_type_name", "description", "active"],
        order: [["test_type_name", "ASC"]],
    });
}

async function getTestTypesById(id) {
      return await TestTypes.findByPk(id, {
        attributes: ["test_type_id", "test_type_name", "description", "active"],
      });
}
    
async function updateTestTypesModel(id, updateFields) {
    
    const [updateCount] = await TestTypes.update(updateFields, {
        where: { test_type_id: id},
    })

    if (!updateCount) return null;
    return await TestTypes.findByPk(id, {
        attributes: ["test_type_id", "test_type_name", "description", "active"],
    });
}

async function toggleTestTypesStatus (id, activeStatus) {
    const testTypes = await TestTypes.findByPk(id);
    if (!testTypes) return null;

    testTypes.active = activeStatus;
    await testTypes.save();
    return testTypes;
}

module.exports = { 
    TestTypes,
    createTestTypes,
    getAllTestTypes,
    getTestTypesById,
    updateTestTypesModel,
    toggleTestTypesStatus 
};