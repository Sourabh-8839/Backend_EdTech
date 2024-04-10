import sequelize from "../database/db.js";
import { DataTypes } from "sequelize";
import Course from "./course.model.js";

const lectureSchema = sequelize.define("lecture", {
  lecture_Id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
  lecture_title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lecture_description: {
    type: DataTypes.TEXT,
  },
  lecture_content: {
    type: DataTypes.STRING,
  },
  lecture_sequence: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
  },
});

lectureSchema.belongsTo(Course);
Course.hasMany(lectureSchema);

export default lectureSchema;
