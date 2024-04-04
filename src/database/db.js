import { Sequelize } from "sequelize";

// Connection parameters

// with URI
// const sequelize = new Sequelize(process.env.DATABASE_URL);

const sequelize = new Sequelize(
  process.env.PGDATABASE,
  process.env.PGUSER,
  process.env.PGPASSWORD,
  {
    host: process.env.PGHOST,
    dialect: "postgres",
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false,
      },
    },
  }
);

export default sequelize;
