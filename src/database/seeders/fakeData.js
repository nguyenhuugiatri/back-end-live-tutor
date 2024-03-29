const faker = require('faker');
const moment = require('moment');
const { LANGUAGES } = require('./categoryData');

// Default password: 123132
const defaultPassword =
  '$2a$12$VvWghIAnvkFgVG1hZ6OGyeaDtEPKGxZYmEu9PExiuke2WCDS5Fywe';

// Fake 3 role ids for tutor, student, admin
const roleIds = {
  tutor: faker.random.uuid(),
  student: faker.random.uuid(),
  admin: faker.random.uuid(),
};

const types = [
  {
    id: 'babdb4f8-6f1f-4563-9d2f-97272a1b1eac',
    title: 'languages',
  },
  {
    id: 'f68b5af3-60ca-430e-b595-f9de8641547c',
    title: 'specialties',
  },
];

const MAJOR_NAMES = {
  fl: { englishName: 'Foreign Languages', vietnameseName: 'Ngoại ngữ' },
  mt: { englishName: 'Marketing', vietnameseName: 'Marketing' },
  of: {
    englishName: 'Office Information',
    vietnameseName: 'Tin học văn phòng',
  },
  ds: { englishName: 'Design', vietnameseName: 'Thiết kế' },
  bs: { englishName: 'Business', vietnameseName: 'Kinh doanh' },
  hc: { englishName: 'Health Care', vietnameseName: 'Chăm sóc sức khỏe' },
  it: {
    englishName: 'Information Technology',
    vietnameseName: 'Công nghệ thông tin',
  },
};

const languageCategory = Object.keys(LANGUAGES).map((keyLanguage) => ({
  id: faker.random.uuid(),
  typeId: types[0].id,
  key: keyLanguage,
  description: LANGUAGES[keyLanguage],
}));

const specialtieCategory = Object.keys(MAJOR_NAMES).map((majorKey) => ({
  id: faker.random.uuid(),
  typeId: types[1].id,
  key: majorKey,
  description: MAJOR_NAMES[majorKey].englishName,
}));

// Fake 50 tutors
const tutors = [...Array(50)].map(() => ({
  id: faker.random.uuid(),
  email: faker.internet.email(),
  password: defaultPassword,
  name: `${faker.name.firstName()} ${faker.name.lastName()}`,
  avatar:
    'https://www.alliancerehabmed.com/wp-content/uploads/icon-avatar-default.png',
  country: faker.address.country(),
  phone: faker.phone.phoneNumber(),
  language: faker.lorem.words(),
  birthday: faker.date.past(),
  isActivated: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  requestPassword: false,
}));

// Fake 50 students
const students = [...Array(50)].map(() => ({
  id: faker.random.uuid(),
  email: faker.internet.email(),
  password: defaultPassword,
  name: `${faker.name.firstName()} ${faker.name.lastName()}`,
  avatar:
    'https://www.alliancerehabmed.com/wp-content/uploads/icon-avatar-default.png',
  country: faker.address.country(),
  phone: faker.phone.phoneNumber(),
  language: faker.lorem.words(),
  birthday: faker.date.past(),
  isActivated: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  requestPassword: false,
}));

const users = [...students, ...tutors];

// Set role for 50 tutors
const tutorRoles = tutors
  .map((tutor) => tutor.id)
  .map((id) => ({
    userId: id,
    roleId: roleIds.tutor,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

// Set role for 50 students
const studentRoles = students
  .map((student) => student.id)
  .map((id) => ({
    userId: id,
    roleId: roleIds.student,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));

const tutorInfo = tutors
  .map((tutor) => tutor.id)
  .map((id) => ({
    id: faker.random.uuid(),
    userId: id,
    video: faker.internet.url(),
    bio: faker.lorem.sentence(),
    languages: [
      ...Array(
        faker.random.number({
          min: 1,
          max: 4,
        }),
      ),
    ]
      .map(
        () =>
          languageCategory[faker.random.number(languageCategory.length - 1)]
            .key,
      )
      .join(','),
    specialties: [
      ...Array(
        faker.random.number({
          min: 1,
          max: 5,
        }),
      ),
    ]
      .map(
        () =>
          specialtieCategory[faker.random.number(specialtieCategory.length - 1)]
            .key,
      )
      .join(','),
    resume: faker.lorem.paragraph(),
    education: faker.lorem.paragraph(),
    experience: faker.lorem.paragraph(),
    interests: faker.lorem.paragraph(),
    profession: faker.lorem.words(),
    accent: faker.lorem.words(),
    targetStudent: faker.lorem.words(),
    createdAt: new Date(),
    updatedAt: new Date(),
    isActivated: true,
  }));

const favoriteTutors = [...Array(200)].map(() => ({
  id: faker.random.uuid(),
  firstId:
    students[
      faker.random.number({
        min: 0,
        max: 49,
      })
    ].id,
  secondId:
    tutors[
      faker.random.number({
        min: 0,
        max: 49,
      })
    ].id,
  createdAt: new Date(),
  updatedAt: new Date(),
}));

const messages = [...Array(1000)].map(() => ({
  id: faker.random.uuid(),
  fromId:
    users[
      faker.random.number({
        min: 0,
        max: 99,
      })
    ].id,
  toId:
    users[
      faker.random.number({
        min: 0,
        max: 99,
      })
    ].id,
  isRead: false,
  content: faker.lorem.paragraph(),
  createdAt: new Date(),
  updatedAt: new Date(),
}));

const schedules = [...Array(100)].map(() => ({
  id: faker.random.uuid(),
  tutorId:
    tutors[
      faker.random.number({
        min: 0,
        max: 49,
      })
    ].id,
  date: moment(faker.date.future()).format('YYYY-MM-DD'),
  endTime: moment(faker.date.future()).format('HH:mm'),
  startTime: moment(faker.date.future()).format('HH:mm'),
  createdAt: new Date(),
  updatedAt: new Date(),
}));

const scheduleDetails = [...Array(300)].map(() => ({
  id: faker.random.uuid(),
  scheduleId:
    schedules[
      faker.random.number({
        min: 0,
        max: 99,
      })
    ].id,
  endPeriod: moment(faker.date.future()).format('HH:mm'),
  startPeriod: moment(faker.date.future()).format('HH:mm'),
  createdAt: new Date(),
  updatedAt: new Date(),
}));

const bookings = [...Array(300)].map(() => ({
  id: faker.random.uuid(),
  scheduleDetailId:
    scheduleDetails[
      faker.random.number({
        min: 0,
        max: 299,
      })
    ].id,
  userId:
    students[
      faker.random.number({
        min: 0,
        max: 49,
      })
    ].id,
  tutorMeetingLink: 'https://meet.livetutor.live',
  studentMeetingLink: 'https://meet.livetutor.live',
  createdAt: new Date(),
  updatedAt: new Date(),
}));

const imageURLs = [
  'https://camblycurriculumicons.s3.amazonaws.com/5eb03d0f9934e038cfcf0372?h=d41d8cd98f00b204e9800998ecf8427e',
  'https://camblycurriculumicons.s3.amazonaws.com/5e2b895e541a832674533c18?h=d41d8cd98f00b204e9800998ecf8427e',
  'https://camblycurriculumicons.s3.amazonaws.com/5e7e51cca52da4ab4bd958e6?h=d41d8cd98f00b204e9800998ecf8427e',
  'https://camblycurriculumicons.s3.amazonaws.com/5fd9240c4143a75bf6c2de8b?h=d41d8cd98f00b204e9800998ecf8427e',
];

const levels = ['Beginner', 'Intermediate', 'Advanced'];

// Fake 50 course
const courses = [...Array(10)].map(() => ({
  id: faker.random.uuid(),
  name: faker.lorem.sentence(),
  description: faker.lorem.paragraph(),
  reason: faker.lorem.paragraph(),
  purpose: faker.lorem.paragraph(),
  level:
    levels[
      faker.random.number({
        min: 0,
        max: 2,
      })
    ],
  other_details: faker.lorem.sentence(),
  imageUrl:
    imageURLs[
      faker.random.number({
        min: 0,
        max: 3,
      })
    ],
  default_price: faker.random.number({
    min: 100,
    max: 500,
  }),
  course_price: faker.random.number({
    min: 100,
    max: 500,
  }),
  createdAt: new Date(),
  updatedAt: new Date(),
}));

const topics = courses.reduce((pre, now) => {
  const topic = [...Array(5)].map((_, index) => ({
    id: faker.random.uuid(),
    courseId: now.id,
    orderCourse: index,
    name: faker.lorem.sentence(),
    description: faker.lorem.paragraph(),
    videoUrl: faker.lorem.sentence(),
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
  return [...pre, ...topic];
}, []);

const majors = Object.entries(MAJOR_NAMES).map(
  ([key, { englishName, vietnameseName }]) => ({
    id: faker.random.uuid(),
    key,
    englishName,
    vietnameseName,
    createdAt: new Date(),
    updatedAt: new Date(),
  }),
);

const wallets = users.map((user) => ({
  id: faker.random.uuid(),
  userId: user.id,
  amount: faker.random.number({
    min: 0,
    max: 5000000,
  }),
  createdAt: new Date(),
  updatedAt: new Date(),
}));

const transactions = bookings.map((booking) => ({
  id: faker.random.uuid(),
  walletId:
    wallets[
      faker.random.number({
        min: 0,
        max: wallets.length - 1,
      })
    ].id,
  bookingId: booking.id,
  price: faker.random.number({
    min: 100000,
    max: 1000000,
  }),
  status: 'success',
  type: ['buy', 'sell', 'deposit', 'cancel', 'return'][
    faker.random.number({
      min: 0,
      max: 4,
    })
  ],
  createdAt: new Date(),
  updatedAt: new Date(),
}));

const fees = [
  {
    id: faker.random.uuid(),
    key: 'pricePerSession',
    price: 100000,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: faker.random.uuid(),
    key: 'pricePerDollar',
    price: 23500,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const reports = [...Array(200)].map(() => ({
  id: faker.random.uuid(),
  userId:
    students[
      faker.random.number({
        min: 0,
        max: 49,
      })
    ].id,
  tutorId:
    tutors[
      faker.random.number({
        min: 0,
        max: 49,
      })
    ].id,
  content: faker.lorem.paragraph(),
  createdAt: new Date(),
  updatedAt: new Date(),
}));

const feeTutor = tutors.map((tutor) => {
  return {
    id: faker.random.uuid(),
    tutorId: tutor.id,
    price: (Math.floor(Math.random() * 10) + 1) * 50 * 1000,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
});

module.exports = {
  tutors,
  students,
  defaultPassword,
  roleIds,
  tutorRoles,
  studentRoles,
  tutorInfo,
  favoriteTutors,
  messages,
  schedules,
  scheduleDetails,
  bookings,
  topics,
  courses,
  majors,
  wallets,
  transactions,
  fees,
  types,
  languageCategory,
  specialtieCategory,
  reports,
  feeTutor,
  up: () => Promise.resolve(),
  down: () => Promise.resolve(),
};
