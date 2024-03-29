import express from 'express';
import validate from 'middlewares/validate';
import { oAuth as oAuthLogin, auth } from 'middlewares/auth';
import authController from 'controllers/auth.controller';
import authValidation from 'validations/auth.validation';

const router = express.Router();

router.post(
  '/register',
  validate(authValidation.register),
  authController.register,
);

router.post('/login', validate(authValidation.login), authController.login);

router.post(
  '/refresh-token',
  validate(authValidation.refresh),
  authController.refresh,
);

router.get(
  '/verifyAccount',
  validate(authValidation.verifyAccount),
  authController.verifyAccount,
);

router.get(
  '/sendActivateAccountMail',
  auth(),
  authController.sendMailActivateAccount,
);

router
  .route('/google')
  .post(
    validate(authValidation.oAuth),
    oAuthLogin('google'),
    authController.oAuth,
  );

router
  .route('/facebook')
  .post(
    validate(authValidation.oAuth),
    oAuthLogin('facebook'),
    authController.oAuth,
  );

export default router;
