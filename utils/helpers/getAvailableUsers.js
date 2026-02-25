const { User } = require('../../modules/users/user.model');
const { Op } = require('sequelize');

async function getAvailableUsersByModel(Model, active = true) {
  const assignedUserIds = await Model.findAll({ attributes: ['user_id'] });
  const userIds = assignedUserIds.map(item => item.user_id);

  const whereClause = {};

  if (active !== undefined) {
    whereClause.active = active;
  }

  if (userIds.length > 0) {
    whereClause.id = { [Op.notIn]: userIds };
  }

  const availableUsers = await User.findAll({
    where: whereClause,
    order: [['username', 'ASC']],
    raw: true,
    attributes: ['id', 'username', 'email'],
  });

  return {
    success: true,
    users: availableUsers,
  };
}

module.exports = {
  getAvailableUsersByModel,
};
