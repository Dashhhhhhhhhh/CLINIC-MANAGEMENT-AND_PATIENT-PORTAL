const { User } = require('../../modules/users/user.model');
const { Doctor } = require('../../modules/doctors/doctor.model');
const { Staff } = require('../../modules/staff/staff.model');
const { Patient } = require('../../modules/patients/patients.model');
const { Op } = require('sequelize');

async function getAvailableUsersByModel(Model) {
  const assignedUserIsds = await Model.findAll({ attributes: ['user_id'] });
  const userIds = assignedUserIsds.map(item => item.user_id);

  const availableUsers = await User.findAll({
    where: {
      id: { [Op.notIn]: userIds },
    },
  });

  return {
    success: true,
    users: availableUsers,
  };
}

module.exports = { getAvailableUsersByModel };
