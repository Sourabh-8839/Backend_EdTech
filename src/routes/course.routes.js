import express from "express";
import { verifyJwt } from "../middleware/auth.middleware.js";
import {
  addCourse,
  deleteCourse,
  enrollUser,
  getAdminCourses,
  getCourses,
  myCourses,
  readOneCourse,
  updateCourse,
  updateLectures,
} from "../controllers/course.controllers.js";
import { upload } from "../middleware/multer.middleware.js";

const router = express.Router();

//get all course api and filtering
router.route("/getCourses").get(verifyJwt, getCourses);

//admin can add cousre api
router.route("/addCourse").post(
  upload.fields([
    {
      name: "lecture",
      maxCount: 2,
    },
  ]),
  verifyJwt,
  addCourse
);

router.route("/deleteCourse").post(verifyJwt, deleteCourse);

router.route("/updatecourse").post(verifyJwt, updateCourse);

router.route("/updateLectures").post(verifyJwt, updateLectures);

//Read Courses Api
router.route("/viewCourses").get(verifyJwt, getAdminCourses);

router.route("/viewOneCourse").get(verifyJwt, readOneCourse);

//enroll Course Api
router.route("/enrollCourses").post(verifyJwt, enrollUser);

//view course
router.route("/mycourses").get(verifyJwt, myCourses);

export default router;
