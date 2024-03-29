import Joi from 'joi';

const scheduleValidation = {};

scheduleValidation.getMany = {
  query: Joi.object({
    date: Joi.date(),
  }),
  body: Joi.object({
    tutorId: Joi.string().guid(),
  }),
};

scheduleValidation.getOne = {
  params: Joi.object({
    scheduleId: Joi.string().required().guid(),
  }),
};

scheduleValidation.register = {
  body: Joi.object({
    date: Joi.date(),
    startDate: Joi.date(),
    endDate: Joi.date(),
    isRepeated: Joi.boolean(),
    startTime: Joi.string()
      .regex(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
      .required(),
    endTime: Joi.string()
      .regex(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/)
      .required(),
  }),
};

scheduleValidation.unregister = {
  params: Joi.object({
    scheduleId: Joi.string().required().guid(),
  }),
};

export default scheduleValidation;
