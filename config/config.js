const db = require("../src/db");

module.exports = {
development: {
  username: db.config.username,
  password: db.config.password,
  database: db.config.database,
  host: db.config.host,
  dialect: db.config.dialect,
  modelsPath: "./src/models",
  migrationsPath: "./src/migrations",
  seedersPath: "./src/seeders",
}
,
  test: {
    username: db.config.username,
    password: db.config.password,
    database: db.config.database,
    host: db.config.host,
    dialect: db.config.dialect,
  },
  production: {
    username: db.config.username,
    password: db.config.password,
    database: db.config.database,
    host: db.config.host,
    dialect: db.config.dialect,
  },
};
