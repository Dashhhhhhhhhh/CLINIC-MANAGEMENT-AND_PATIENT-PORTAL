// rules

const rolePermissions = {
  admin: ['all'],

  doctor: [
    'view_patient',
    'update_patient',
    'create_result',
    'update_result',
    'view_result',
    'delete_result',
  ],

  medtech: ['view_patient', 'create_result:lab', 'view_result', 'delete_result'],

  radtech: ['create_result:imaging', 'view_result'],
  front_desk: [
    'view_patient',
    'create_billing',
    'view_billing',
    'manage_appointments',
    'create_patient',
  ],

  patient: ['view_own_patient', 'view_own_results'],
};

module.exports = rolePermissions;
