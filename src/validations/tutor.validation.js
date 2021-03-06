import Joi from 'joi';

const tutorValidation = {};

tutorValidation.getMany = {
  query: Joi.object({
    page: Joi.number().min(1),
    perPage: Joi.number().min(1),
  }),
};

export default tutorValidation;
