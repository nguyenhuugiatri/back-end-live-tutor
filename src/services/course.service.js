import { Course, Topic, sequelize } from 'database/models';

const courseService = {};

courseService.getCourses = async () => {
  const courses = await Course.findAll({
    attributes: [
      '*',
      [sequelize.fn('COUNT', sequelize.col('Topics.courseId')), 'topicCount'],
    ],
    group: [sequelize.col('Course.id')],
    include: [
      {
        model: Topic,
        attributes: [],
      },
    ],
    raw: true,
  });
  return courses;
};

export default courseService;