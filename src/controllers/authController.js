const { createUser, loginUser } = require('../models/userModel');
const { hashPassword, generateToken, comparePassword } = require('../utils/security');
const { Role } = require('../models/roleModel');
const { User } = require('../models/userModel');
const { Staff } = require("../models/staffModel");


async function registerAuthController(req, res) {
    try {
        const { email, username, password, role_id, gender} = req.body;

        
        if (!email || !username || !password || !role_id || !gender) {
            return res.status(400).json({ success: false, error: "All fields are required." });
        }

        
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({
                success: false,
                error: "Password must be at least 8 characters and include uppercase, lowercase, number, and special character."
            });
        }

        const role = await Role.findByPk(role_id);
        if (!role) {
            return res.status(400).json({ success: false, error: "Invalid role ID. Role does not exist."});
        }
       
        const validGenders = ["male", "female"];
        if (gender && !validGenders.includes(gender.toLowerCase())) {
            return res.status(400).json({ success: false, error: "Invalid gender" });
        }

        const cleanedEmail = email.trim().toLowerCase();
        const cleanedUsername = username.trim();
        const cleanedGender = gender.trim().toLowerCase();

        
        const password_hash = await hashPassword(password);

      
        const user = await createUser({
        email: cleanedEmail,
        username: cleanedUsername,
        password_hash,
        gender: cleanedGender,
        role_id: role.role_id,
        });

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                gender: user.gender,
                role_id: user.role_id,
                active: user.active,
            },
        });

} catch (err) {
    console.error("Error creating user:", err);

    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        error: "Email or username already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Internal server error.",
    });
  }
}

async function loginAuthController(req, res) {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ success: false, error: "Username and password are required." });
        }

        const cleanedUsername = username.trim().toLowerCase();

        const user = await User.findOne({ 
            where: { username: cleanedUsername },
            include: [
                { model: Role, as: "role", attributes: ["role_name"] },
                { model: Staff, as: "staff", attributes: ["staff_id"], required: false }
            ],
        });
    
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found." });
        }

        if (!user.active) {
            return res.status(403).json({ success: false, error: "User account is inactive." });
        }

        const validPassword = await comparePassword(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ success: false, error: "Invalid username or password." });
        }

        const roleName = user.role ? user.role.role_name : null;
        const staffId = user.staff ? user.staff.staff_id : null;

        const payload = { 
            user_id: user.id,
            staff_id: staffId,
            role: roleName
        };

        const token = generateToken(payload);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role_id: user.role_id,
                role_name: roleName,
                active: user.active,
            },
            staff_id: staffId,
            token,
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
}




module.exports = {
    registerAuthController,
    loginAuthController
};
