import sequelize from "../database/db.js";

import { DataTypes, UUID } from "sequelize";
import User from "./user.models.js";

const courseSchema = sequelize.define(
  "course",
  {
    courseId: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    courseName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    level: {
      type: DataTypes.ENUM,
      values: ["Basic", "Intermediate", "professional"],
      default: "Basic",
    },
  },
  { timestamps: true }
);

courseSchema.belongsTo(User);
User.hasMany(courseSchema);

export default courseSchema;
