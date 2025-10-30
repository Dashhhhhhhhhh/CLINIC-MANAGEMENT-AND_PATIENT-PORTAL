// checker

const rolePermission = require('../config/permissions');

function checkSinglePermission (requiredPermission, permissions) {

        if (permissions.includes("all")) {
            return true;
        }

        if (permissions.includes(requiredPermission)) {
            return true;
        }

        if (requiredPermission.includes(":")) {
            const[base] = requiredPermission.split(":");
            if (permissions.includes(base)) {
                return true;
            }
        }
        
        return false;
    }

function rbacMiddleWare(requiredPermission) {
    return (req, res, next) => {
        if(!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized" })
        }

        const role = req.user.role;
        const permissions = rolePermission[role] || [];

        if (checkSinglePermission(requiredPermission, permissions)) {
            return next();
        }
        return res.status(403).json({ error: true, message: "Forbidden Insufficient permission" });
    };

}




module.exports = rolePermission;