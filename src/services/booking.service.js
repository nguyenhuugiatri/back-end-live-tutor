import {
  sequelize,
  Booking,
  User,
  ScheduleDetail,
  Schedule,
  Transaction,
} from 'database/models';
import ApiError from 'utils/ApiError';
import { confirmBookingNewSchedule } from 'configs/nodemailer';
import { paginate } from 'utils/sequelize';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import { paymentService } from 'services';
import {
  TRANSACTION_TYPES,
  ERROR_CODE,
  DATE_TIME_FORMAT,
} from 'utils/constants';
import { orderBy } from 'lodash';

const bookingService = {};

bookingService.book = async (userId, scheduleDetailIds, origin) => {
  // Get tutor and student info
  const student = await User.findByPk(userId);
  const scheduleDetails = await ScheduleDetail.findAll({
    where: {
      id: scheduleDetailIds,
    },
    include: [
      {
        model: Schedule,
        as: 'scheduleInfo',
        include: [
          {
            model: User,
            as: 'tutorInfo',
            attributes: {
              exclude: ['password'],
            },
          },
        ],
      },
    ],
  });
  const tutor = scheduleDetails?.[0]?.scheduleInfo?.tutorInfo;

  const result = await sequelize.transaction(async (transaction) => {
    const existsBookings = await Booking.findAll({
      where: {
        scheduleDetailId: scheduleDetailIds,
      },
    });

    if (
      existsBookings.length &&
      existsBookings.some((item) => item.isDeleted === false)
    )
      throw new ApiError(
        ERROR_CODE.BOOKING_EXIST.code,
        ERROR_CODE.BOOKING_EXIST.message,
      );

    const bookingPromises = scheduleDetailIds.map((scheduleDetailId) =>
      Booking.create(
        {
          userId,
          scheduleDetailId,
        },
        { transaction },
      ),
    );

    const bookings = await Promise.all(bookingPromises);

    const purchase = await paymentService.purchase(
      student.id,
      tutor.id,
      scheduleDetailIds.length,
      transaction,
    );

    if (!purchase)
      throw new ApiError(
        ERROR_CODE.PAYMENT_SYSTEM.code,
        ERROR_CODE.PAYMENT_SYSTEM.message,
      );

    const { buyerWallet, sellerWallet, currentPricePerSession } = purchase;

    const buyerTransactionPromises = bookings.map(async (booking) => {
      return Transaction.create(
        {
          walletId: buyerWallet.id,
          bookingId: booking.id,
          price: -currentPricePerSession,
          status: 'success',
          type: TRANSACTION_TYPES.BUY,
        },
        { transaction },
      );
    });

    await Promise.all(buyerTransactionPromises);

    const sellerTransactionPromises = bookings.map(async (booking) => {
      return Transaction.create(
        {
          walletId: sellerWallet.id,
          bookingId: booking.id,
          price: +currentPricePerSession,
          status: 'success',
          type: TRANSACTION_TYPES.SELL,
        },
        { transaction },
      );
    });

    await Promise.all(sellerTransactionPromises);

    return bookings;
  });

  if (result) {
    //Mailing

    if (student && tutor) {
      let dates = scheduleDetails.map((item) => {
        const { scheduleInfo, startPeriod, endPeriod } = item;
        const bookingId = result.find(
          (book) => book.scheduleDetailId === item.id,
        );

        return {
          date: scheduleInfo.date,
          start: startPeriod,
          end: endPeriod,
          bookingId: bookingId.id,
        };
      });

      dates = orderBy(dates, ['date', 'start'], ['asc', 'asc']);

      const roomName = uuidv4();
      confirmBookingNewSchedule({
        student: student.dataValues,
        tutor: tutor.dataValues,
        dates,
        roomName,
        isSendTutor: true,
        origin,
      });
      confirmBookingNewSchedule({
        student: student.dataValues,
        tutor: tutor.dataValues,
        dates,
        roomName,
        isSendTutor: false,
        origin,
      });
    }
  }

  return result;
};

bookingService.updateLink = async (bookingId, isUpdateTutor, link) => {
  if (isUpdateTutor)
    return await Booking.update(
      {
        tutorMeetingLink: link,
      },
      {
        where: {
          id: bookingId,
        },
      },
    );
  else
    return await Booking.update(
      {
        studentMeetingLink: link,
      },
      {
        where: {
          id: bookingId,
        },
      },
    );
};

bookingService.cancelBooking = async (userId, scheduleDetailIds) => {
  const result = await sequelize.transaction(async (transaction) => {
    const existsBookings = await Booking.findAll({
      where: {
        scheduleDetailId: scheduleDetailIds,
        isDeleted: false,
      },
      include: [
        {
          model: User,
          as: 'userInfo',
          attributes: {
            exclude: ['password'],
          },
        },
        {
          model: ScheduleDetail,
          as: 'scheduleDetailInfo',
          include: {
            model: Schedule,
            as: 'scheduleInfo',
            include: {
              model: User,
              as: 'tutorInfo',
              attributes: {
                exclude: ['password'],
              },
            },
          },
        },
      ],
    });

    if (existsBookings.length < scheduleDetailIds.length)
      throw new ApiError(
        ERROR_CODE.BOOKING_NOT_EXIST.code,
        ERROR_CODE.BOOKING_NOT_EXIST.message,
      );

    const scheduleBookingInfo = existsBookings?.[0]?.scheduleDetailInfo;
    const dateBooking = scheduleBookingInfo.scheduleInfo.date;
    const timeBooking = scheduleBookingInfo.startPeriod;

    let duration = moment.duration(
      moment(`${dateBooking} ${timeBooking}`, DATE_TIME_FORMAT).diff(moment()),
    );
    let hours = duration.asHours();
    const canCancelBook = hours >= 24;
    if (!canCancelBook) {
      throw new ApiError(
        ERROR_CODE.BOOKING_CANCEL_BEFORE_1DAY.code,
        ERROR_CODE.BOOKING_CANCEL_BEFORE_1DAY.message,
      );
    }

    const student = existsBookings?.[0]?.userInfo;
    const tutor =
      existsBookings?.[0]?.scheduleDetailInfo?.scheduleInfo?.tutorInfo;

    const ids = existsBookings.map((item) => {
      const { id, userId: userIdBooking } = item;
      if (userIdBooking !== userId)
        throw new ApiError(
          ERROR_CODE.PERMISSION_DENIED.code,
          ERROR_CODE.PERMISSION_DENIED.message,
        );
      return id;
    });

    const refund = await paymentService.refund(
      student.id,
      tutor.id,
      ids.length,
      transaction,
    );

    const transactions = await Transaction.findAll({
      where: {
        bookingId: ids,
      },
    });

    if (!refund)
      throw new ApiError(
        ERROR_CODE.PAYMENT_SYSTEM.code,
        ERROR_CODE.PAYMENT_SYSTEM.message,
      );

    const { buyerWallet, sellerWallet, currentPricePerSession } = refund;
    const refundTractionPromises = ids.map((bookingId) => {
      transactions.map((item) => {
        const { type } = item;
        if (type === TRANSACTION_TYPES.BUY) {
          return Transaction.create(
            {
              walletId: buyerWallet.id,
              bookingId: bookingId,
              price: +currentPricePerSession,
              status: 'success',
              type: TRANSACTION_TYPES.CANCEL,
            },
            { transaction },
          );
        }
        if (type === TRANSACTION_TYPES.SELL) {
          return Transaction.create(
            {
              walletId: sellerWallet.id,
              bookingId: bookingId,
              price: -currentPricePerSession,
              status: 'success',
              type: TRANSACTION_TYPES.RETURN,
            },
            { transaction },
          );
        }
      });
      return Promise.all(refundTractionPromises);
    });

    const deletedBookings = await Booking.update(
      { isDeleted: true },
      {
        where: { id: ids },
      },
      transaction,
    );

    return deletedBookings;
  });

  return result;
};

bookingService.getBookingListForStudent = async ({
  userId,
  page = 1,
  perPage = 10,
}) => {
  const bookingList = await Booking.findAndCountAll({
    include: [
      {
        model: ScheduleDetail,
        as: 'scheduleDetailInfo',
        include: [
          {
            model: Schedule,
            as: 'scheduleInfo',
            include: [
              {
                model: User,
                as: 'tutorInfo',
                attributes: {
                  exclude: ['password'],
                },
              },
            ],
          },
        ],
      },
    ],
    where: {
      userId,
      isDeleted: false,
    },
    ...paginate({ page, perPage }),
    order: [['createdAt', 'DESC']],
  });
  return bookingList;
};

bookingService.getBookingListForTutor = async ({
  tutorId,
  page = 1,
  perPage = 10,
}) => {
  const bookedSchedule = await ScheduleDetail.findAndCountAll({
    include: [
      {
        model: Schedule,
        as: 'scheduleInfo',
        where: {
          tutorId,
        },
      },
      {
        model: Booking,
        as: 'bookingInfo',
        where: {
          isDeleted: false,
        },
        include: [
          {
            model: User,
            as: 'userInfo',
            attributes: {
              exclude: ['password'],
            },
          },
        ],
      },
    ],
    ...paginate({ page, perPage }),
    order: [['createdAt', 'DESC']],
  });
  return bookedSchedule;
};

export default bookingService;
