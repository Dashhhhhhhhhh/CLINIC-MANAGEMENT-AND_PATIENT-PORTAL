require('dotenv').config();   

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const authenticateJWT = require('./middleware/authMiddleware');
const jsonErrorHandler = require('./middleware/jsonError');
const  sequelize  = require("./db");

app.use(express.json());
app.use(jsonErrorHandler);

require("./models/userModel");
require("./models/staffModel");
require("./models/doctorModel");
require("./models/adminModel");
require("./models/patientModel");
require("./models/specializationModel");
require("./models/positionModel");
require("./models/roleModel");
require("./models/associationModel");
require("./models/resultModel");
require("./models/testTypesModel");
require("./models/hematologyModel");
require("./models/urinalysisModel");
require("./models/xrayModel");
require("./models/ultrasoundModel");


const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/users');
const staffRoutes = require('./routes/staff');
const doctorRoutes = require('./routes/doctor');
const adminRoutes = require('./routes/admin');
const patientRoutes = require('./routes/patient');
const specializationRoutes = require('./routes/specialization');
const positionRoutes = require('./routes/position');
const rolesRoutes = require('./routes/roles');
const hematologyRoutes = require("./routes/hematologyResult");
const testTypesRoutes = require("./routes/testTypes");
const resultRoutes = require("./routes/result");
const urinalysisRoutes = require("./routes/urinalysis");
const xrayRoutes = require("./routes/xray");
const ultrasoundRoutes = require("./routes/ultrasound");

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/staff', staffRoutes);
app.use('/doctors', doctorRoutes);
app.use('/admin', adminRoutes);
app.use('/patients', patientRoutes);
app.use('/specializations', specializationRoutes);
app.use('/positions', positionRoutes);
app.use('/roles', rolesRoutes);
app.use('/results', resultRoutes);
app.use("/hematology", hematologyRoutes);
app.use("/test-types", testTypesRoutes);
app.use("/urinalysis", urinalysisRoutes);
app.use("/xray", xrayRoutes);
app.use("/ultrasound", ultrasoundRoutes);

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.get('/protected', authenticateJWT, (req, res) => {
  res.send(`Hello ${req.user.username}, you have access to this protected route!`);
});

sequelize.sync()
  .then(() => {
    console.log("✅ Database synced!");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => console.error("❌ Failed to sync:", err));
// { alter: true }