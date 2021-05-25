import Joi from 'joi';

const paymentValidation = {};

paymentValidation.getWallet = {
  body: Joi.object({}),
  params: Joi.object({}),
  query: Joi.object({}),
};

paymentValidation.getHistory = {
  body: Joi.object({}),
  params: Joi.object({}),
  query: Joi.object({
    date: Joi.date(),
    page: Joi.number().min(1),
    perPage: Joi.number().min(1),
  }),
};

paymentValidation.deposit = {
  body: Joi.object({
    price: Joi.number().min(1).required(),
  }),
  params: Joi.object({}),
  query: Joi.object({}),
};

export default paymentValidation;
