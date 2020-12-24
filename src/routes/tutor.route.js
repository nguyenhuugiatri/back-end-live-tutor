import express from 'express';
import tutorController from 'controllers/tutor.controller';
import auth from 'middlewares/auth';
import tutorValidation from 'validations/tutor.validation';
import validate from 'middlewares/validate';

const router = express.Router();

router.get(
  '/',
  auth(),
  validate(tutorValidation.getMany),
  tutorController.getMany,
);

export default router;