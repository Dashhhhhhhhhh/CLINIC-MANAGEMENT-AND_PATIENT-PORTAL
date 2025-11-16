require('dotenv').config();   
const cors = require("cors")

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const authenticateJWT = require('./middleware/authMiddleware');
const jsonErrorHandler = require('./middleware/jsonError');
const  sequelize  = require("./db");

app.use(express.json());
app.use(jsonErrorHandler);

app.use(cors({
  origin: "*",
}));


require("./modules/users/user.model");
require("./modules/staff/staff.model");
require("./modules/doctors/doctor.model");
require("./modules/patients/patients.model");
require("./modules/specialization/specialization.model");
require("./modules/positions/position.model");
require("./modules/roles/roles.model");
require("./models/associationModel");
require("./models/resultModel");
require("./models/testTypesModel");
require("./models/hematologyModel");
require("./models/urinalysisModel");
require("./models/xrayModel");
require("./models/ultrasoundModel");


const userRoutes = require("./modules/users/user.routes");
const authRoutes = require("./modules/users/auth.routes");
const staffRoutes = require('./modules/staff/staff.routes');
const doctorRoutes = require("./modules/doctors/doctor.routes");
const patientRoutes = require('./modules/patients/patients.routes');
const specializationRoutes = require('./modules/specialization/specialization.routes');
const positionRoutes = require('./modules/positions/position.routes');
const rolesRoutes = require('./modules/roles/roles.routes');
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