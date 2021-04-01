import { Booking, User, ScheduleDetail, Schedule } from 'database/models';
import httpStatus from 'http-status';
import ApiError from 'utils/ApiError';
import { confirmBookingNewSchedule } from 'configs/nodemailer';
import moment from 'moment';

const bookingService = {};

bookingService.book = async (userId, scheduleDetailIds) => {
  const existsBookings = await Booking.findAll({
    where: {
      scheduleDetailId: scheduleDetailIds,
    },
  });

  if (existsBookings.length)
    throw new ApiError(httpStatus.BAD_REQUEST, 'Booking already exists');

  const bookingPromises = scheduleDetailIds.map((scheduleDetailId) =>
    Booking.create({
      userId,
      scheduleDetailId,
    }),
  );

  const bookings = await Promise.all(bookingPromises);

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
          },
        ],
      },
    ],
  });

  if (
    student &&
    scheduleDetails.length &&
    scheduleDetails[0]?.scheduleInfo?.tutorInfo
  ) {
    const dates = scheduleDetails
      .map((item) => {
        const { scheduleInfo, startPeriod, endPeriod } = item;
        const date = moment(scheduleInfo.date, 'YYYY-MM-DD').format(
          'YYYY-MM-DD',
        );
        const start = moment(startPeriod, 'HH:mm').format('HH:mm');
        const end = moment(endPeriod, 'HH:mm').format('HH:mm');
        return {
          date,
          start,
          end,
        };
      })
      .reverse();

    confirmBookingNewSchedule({
      receiver: student?.email,
      tutor: scheduleDetails[0]?.scheduleInfo?.tutorInfo?.name,
      dates,
    });
  }

  return bookings;
};

bookingService.cancelBooking = async (userId, scheduleDetailIds) => {
  const existsBookings = await Booking.findAll({
    where: {
      scheduleDetailId: scheduleDetailIds,
    },
  });

  if (existsBookings.length < scheduleDetailIds.length)
    throw new ApiError(httpStatus.NOT_FOUND, 'Booking does not exist');

  const ids = existsBookings.map((item) => {
    const { id, userId: userIdBooking } = item;
    if (userIdBooking !== userId)
      throw new ApiError(httpStatus.FORBIDDEN, 'Permission denied');
    return id;
  });

  const deletedBookings = await Booking.destroy({
    where: { id: ids },
  });

  return deletedBookings;
};

export default bookingService;