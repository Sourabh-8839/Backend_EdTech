import sequelize from "../database/db.js";

import { DataTypes } from "sequelize";
import User from "./user.models.js";

const forgotPassword = sequelize.define("ForgotPassword", {
  uuId: {
    type: DataTypes.STRING,
    primaryKey: true,
  },
  isActive: DataTypes.BOOLEAN,
});

User.hasMany(forgotPassword);
forgotPassword.belongsTo(User);

export default forgotPassword;
