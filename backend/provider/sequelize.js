const { Sequelize } = require("sequelize")

const sequelize = new Sequelize(process.env.DATABASE_URI, {
  logging: false,
  define: {
    timestamps: false,
  },
})

sequelize
  .authenticate()
  .then(() => console.log("Connected to DB successfully..."))
  .catch(() => console.log("Fail connecting to DB..."))

module.exports = sequelize
