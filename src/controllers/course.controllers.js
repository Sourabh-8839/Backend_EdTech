import { ApiError } from "../utils/apiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadCloudinary } from "../utils/cloudinary.js";
import Course from "../models/course.model.js";
import Lecture from "../models/lecture.model.js";
import { apiResponse } from "../utils/apiResponse.js";
import Enrollment from "../models/enroll.model.js";
import sequelize from "../database/db.js";
import { sendEmail } from "../utils/emailSend.js";

const addCourse = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.Role !== "admin" && user.Role !== "teacher") {
    throw new ApiError(402, "Admin or teacher only add coures");
  }

  const t = await sequelize.transaction();

  try {
    const {
      courseName,
      description,
      category,
      level,
      lecture_title,
      lecture_description,
      lecture_sequence,
    } = req.body;

    console.log(req.body);
    if (
      [
        courseName,
        description,
        category,
        level,
        lecture_title,
        lecture_description,
        lecture_sequence,
      ].some((field) => field?.trim === "" || field === undefined)
    ) {
      throw new ApiError(400, "All fields Required");
    }

    const localFilePath = req?.files?.lecture[0]?.path;

    const lecture_content = await uploadCloudinary(localFilePath);

    const course = await Course.create(
      {
        courseName,
        description,
        category,
        level,
        UserId: user.id,
      },
      { transaction: t }
    );

    if (!course) {
      throw new ApiError(500, "Internal Server Error please Upload Again");
    }

    const lectures = await Lecture.create(
      {
        lecture_content: lecture_content.url,
        lecture_title,
        lecture_description,
        lecture_sequence,
        courseCourseId: course.courseId,
      },
      { transaction: t }
    );

    if (!lectures) {
      throw new ApiError(500, "Something went Wrong while creating lectures");
    }

    await t.commit();
    return res
      .status(200)
      .json(
        new apiResponse(200, { course, lectures }, "Course Upload Successfully")
      );
  } catch (error) {
    await t.rollback();
    throw new ApiError(
      403,
      error?.message || "Something went Wrong while adding course"
    );
  }
});

//getadmin courses
const getAdminCourses = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.Role !== "admin") {
    throw new ApiError(403, "Admin only access courses");
  }
  let { page = 1, level, category } = req.query;

  page = Number(page);

  let whereCondition = {};
  if (level) {
    whereCondition.level = level;
  }
  if (category) {
    whereCondition.category = category;
  }

  const Item_Per_Page = 10;

  const courses = await Course.findAndCountAll({
    where: whereCondition,
    limit: Item_Per_Page,
    offset: (page - 1) * Item_Per_Page,
  });

  const totalItems = courses.count;
  return res.status(200).json(
    new apiResponse(200, {
      courses: courses,
      hasPreviousPage: page > 1,
      currentPage: page,
      hasNextPage: Item_Per_Page * page < totalItems,
      previousPage: page - 1,
      nextPage: page + 1,
      lastPage: Math.ceil(totalItems / Item_Per_Page),
    })
  );

  return res
    .status(200)
    .json(new apiResponse(200, { course }, "Admin All Course"));
});

const readOneCourse = asyncHandler(async (req, res) => {
  const user = req.user;

  const { courseId } = req.query;

  if (!courseId) {
    throw new ApiError("CourseId is Required");
  }

  const course = await Course.findByPk(courseId);

  const Lectures = await Lecture.findAll({
    where: {
      courseCourseId: courseId,
    },
  });

  if (!course) {
    throw new ApiError(404, "Course is not found or Remove by Admin");
  }

  return res
    .status(200)
    .json(
      new apiResponse(200, { course, Lectures }, "Course Details for read")
    );
});

const updateCourse = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.Role !== "admin") {
    throw new ApiError(403, "admin only update courses");
  }

  console.log(req.body);
  const { courseName, description, courseId } = req.body;

  let whereConditionForCourse = {};

  if (courseName) {
    whereConditionForCourse.courseName = courseName;
  }
  if (description) {
    whereConditionForCourse.description = description;
  }

  await Course.update(whereConditionForCourse, {
    where: {
      courseId: courseId,
    },
  });

  const updatedCourse = await Course.findByPk(courseId);

  // console.log(updatedCourse);

  return res
    .status(200)
    .json(new apiResponse(200, { updatedCourse }, "Update Succesfully "));
});

const updateLectures = asyncHandler(async (req, res) => {
  const user = req.user;

  if (user.Role !== "admin") {
    throw new ApiError(403, "admin only update courses");
  }

  const { lecture_description, lecture_title, lecture_Id } = req.body;

  let whereConditionForLectures = {};

  if (lecture_description) {
    whereConditionForLectures.lecture_description = lecture_description;
  }

  if (lecture_title) {
    whereConditionForLectures.lecture_title = lecture_title;
  }

  await Lecture.update(whereConditionForLectures, {
    where: {
      lecture_Id: lecture_Id,
    },
  });

  const updatelecture = await Lecture.findByPk(lecture_Id);

  console.log(updatelecture);

  return res
    .status(200)
    .json(
      new apiResponse(200, { updatelecture }, "Successfully update Lectures")
    );
});

const deleteCourse = asyncHandler(async (req, res) => {
  const user = req.user;

  const { courseId, lectureId } = req.query;

  if (courseId) {
    await Course.destroy({
      where: {
        courseId: courseId,
      },
      force: true,
    });
  } else if (lectureId) {
    await Lecture.destroy({
      where: {
        lecture_Id: lectureId,
      },
      force: true,
    });
  } else {
    throw new ApiError(403, "LectureId or courseId must be required");
  }

  return res
    .status(200)
    .json(new apiResponse(200, {}, "Delete Course Succesfully"));
});

//get all courses
const getCourses = asyncHandler(async (req, res) => {
  let { page = 1, level, category } = req.query;

  page = Number(page);

  let whereCondition = {};
  if (level) {
    whereCondition.level = level;
  }
  if (category) {
    whereCondition.category = category;
  }

  const Item_Per_Page = 1;

  const courses = await Course.findAndCountAll({
    where: whereCondition,
    limit: Item_Per_Page,
    offset: (page - 1) * Item_Per_Page,
  });

  console.log(courses);

  const totalItems = courses.count;

  return res.status(200).json(
    new apiResponse(200, {
      courses: courses,
      hasPreviousPage: page > 1,
      currentPage: page,
      hasNextPage: Item_Per_Page * page < totalItems,
      previousPage: page - 1,
      nextPage: page + 1,
      lastPage: Math.ceil(totalItems / Item_Per_Page),
    })
  );
});

//Enrolled user
const enrollUser = asyncHandler(async (req, res) => {
  const user = req.user;

  const { courseId } = req.body;

  console.log(courseId);

  const course = await Course.findByPk(courseId);

  if (!course) {
    throw new ApiError(404, "Course does not exist");
  }

  const alreadyEnrolled = await Enrollment.findOne({ UserId: user.id });

  if (alreadyEnrolled) {
    throw new ApiError(409, "Already User Enrolled");
  }

  const enrollmentUser = await Enrollment.create({
    courseCourseId: courseId,
    UserId: user.id,
  });

  if (!enrollmentUser) {
    throw new ApiError(502, "User Not Enrolled in course");
  }

  await sendEmail(
    user.email,
    "User Enrollment",
    `You are succesfully enrolled in ${course.courseName}`
  );

  return res
    .status(200)
    .json(
      new apiResponse(
        200,
        { course, enrollmentUser },
        "User Enrolled succesfully"
      )
    );
});

const myCourses = asyncHandler(async (req, res) => {
  const user = req.user;

  const courses = await Enrollment.findAll({ where: { UserId: user.id } });

  return res
    .status(200)
    .json(new apiResponse(200, { courses }, "Sucessfully find courses"));
});

export {
  addCourse,
  getCourses,
  enrollUser,
  myCourses,
  getAdminCourses,
  readOneCourse,
  deleteCourse,
  updateCourse,
  updateLectures,
};
