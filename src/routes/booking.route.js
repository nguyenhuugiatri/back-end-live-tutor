import bookingController from 'controllers/booking.controller';
import express from 'express';
import { auth } from 'middlewares/auth';
import validate from 'middlewares/validate';
import bookingValidation from 'validations/booking.validation';

const router = express.Router();

router.post(
  '/',
  auth(),
  validate(bookingValidation.book),
  bookingController.book,
);

router.delete(
  '/',
  auth(),
  validate(bookingValidation.cancelBooking),
  bookingController.cancelBooking,
);

router.get('/list/student', auth(), bookingController.getBookingListForStudent);

router.get('/list/tutor', auth(), bookingController.getBookingListForTutor);

export default router;
