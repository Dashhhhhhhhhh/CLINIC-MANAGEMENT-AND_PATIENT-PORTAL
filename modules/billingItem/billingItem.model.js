const sequelize = require("../../db");
const { DataTypes } = require("sequelize");
const { Billing } = require("../billingMain/billingMain.model");


const BillingItem = sequelize.define(
    "BillingItem",
    {
        billing_item_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        billing_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: { tableName: "billing", schema: "billing_table" },
                key: "billing_id",
            },
        },
        service_id: {
            type: DataTypes.UUID,
            allowNull: true,
            references: {
                model: { tableName:  "billing_service", schema: "billing_table" },
                key: "service_id",
            },
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        quantity: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        unit_price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
        },
        subtotal: {
            type: DataTypes.DECIMAL(10, 2), 
            allowNull: false,
        },
        is_deleted: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
            defaultValue: false,
        },
        created_by: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        updated_by: {
            type: DataTypes.UUID,
        },
        deleted_by: {
            type: DataTypes.UUID,
        },
        deleted_at: {
            type: DataTypes.DATE
        },
    },
    {
        tableName: "billing_item",
        schema: "billing_table",
        timestamps: true,
        createdAt: "created_at",
        updatedAt: "updated_at",
   } 
)

async function createBillingItem(data) {

    return await BillingItem.create({
        billing_item_id: data.billing_item_id,
        billing_id: data.billing_id,
        service_id: data.service_id,
        description: data.description,
        quantity: data.quantity,
        unit_price: data.unit_price,
        subtotal: data.subtotal,
        created_by: data.created_by
    })
}

async function getAllItem() {

    return await BillingItem.findAll({
        attributes: [
            "billing_item_id",
            "billing_id",
            "service_id",
            "description",
            "quantity",
            "unit_price",
            "subtotal"
        ],
        order: [[ "created_at", "DESC"]],
    })
}

async function getItemById(id) {
    
    return await BillingItem.findOne({
        where: { billing_item_id: id },
        attributes: [
            "billing_item_id",
            "billing_id",
            "service_id",
            "description",
            "quantity",
            "unit_price",
            "subtotal"
        ],    
    })
}

async function getItemByPatientId(patient_id) {
    
    return await BillingItem.findAll({
        where: { patient_id: id },
        attributes: [
            "billing_item_id",
            "billing_id",
            "service_id",
            "description",
            "quantity",
            "unit_price",
            "subtotal"
        ],  
    })
}

async function updateBillingItem(id, updateFields) {
    
    if (!updateFields || Object.keys(updateFields).length === 0) return null;

    const [updateCount] = await BillingItem.update(updateFields, {
        where: { billing_item_id: id },
    })

    if (!updateCount) return null;

    return await BillingItem.findOne({
        where: {billing_item_id: id},
        attributes: [
            "billing_item_id",
            "billing_id",
            "service_id",
            "description",
            "quantity",
            "unit_price",
            "subtotal"
        ],  
    })
}

async function toggleDeletebillingItem (id, updated_by) {
        
    const item = await BillingItem.findOne({
        where: {billing_item_id: id},
        attributes: [ "billing_item_id", "is_deleted" ],
    });

    if (!item) return null;

    const newDeleteStatus = !item.is_deleted;

    await BillingItem.update({ is_deleted : newDeleteStatus, updated_by: updated_by, updated_at: new Date() },
        {where: {billing_item_id: item.billing_item_id} } 
    );

    item.is_deleted = newDeleteStatus;
    return item;
}

module.exports = { 
    BillingItem,
    createBillingItem,
    getAllItem,
    getItemById,
    getItemByPatientId,
    updateBillingItem,
    toggleDeletebillingItem
};