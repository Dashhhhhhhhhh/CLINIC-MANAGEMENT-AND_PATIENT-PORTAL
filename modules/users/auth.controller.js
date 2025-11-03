const { registerAuthService, loginAuthService } = require('./user.service');


async function registerAuthController(req, res) {
    try {

        const { email, username, password, gender, role_id } = req.body;

      
        const result = await registerAuthService(
            email,
            username,
            password,
            gender,
            role_id
        );

        if (!result.success) return res.status(400).json(result); 

        return res.status(200).json(result);

    } catch (error) {
    console.error("Error creating user:", error);
    if (error.errors) console.error(error.errors);
    if (error.parent) console.error(error.parent);

    if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({
        success: false,
        error: "Email or username already exists.",
        });
    }

    return res.status(500).json({
        success: false,
        error: "Server error while creating user",
    });
    }
}

async function loginAuthController(req, res) {
    try {
        const { username, password } = req.body;

        const result = await loginAuthService(username, password);
        
        if (!result.success) return res.status(400).json(result); 

        return res.status(200).json(result);

    } catch (error) {
    console.error("Error logging in:", error);
    return res.status(500).json({
        success: false,
        error: "Internal server error during login.",
    });
    }
}




module.exports = {
    registerAuthController,
    loginAuthController
};
