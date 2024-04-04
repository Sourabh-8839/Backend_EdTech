import sequelize from "../database/db.js";
import { Sequelize, DataTypes } from "sequelize";

const userSchema = sequelize.define("User", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },

  userName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  Role: {
    type: DataTypes.ENUM,
    values: ["student", "teacher", "admin"],
    defaultValue: "student",
  },
  refreshToken: {
    type: DataTypes.STRING,
  },
});

export default userSchema;
