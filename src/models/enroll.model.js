import sequelize from "../database/db.js";

import { DataTypes } from "sequelize";
import User from "./user.models.js";
import Course from "./course.model.js";

const enrollmentSchema = sequelize.define(
  "enrollment",
  {
    enrollment_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
  },
  { timestamps: true }
);

enrollmentSchema.belongsTo(User);
User.hasMany(Course);

enrollmentSchema.belongsTo(Course);
Course.hasMany(enrollmentSchema);

export default enrollmentSchema;
