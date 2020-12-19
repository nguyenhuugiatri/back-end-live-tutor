import ApiError from 'utils/ApiError';
import httpStatus from 'http-status';
import { User } from 'database/models';
import { Role } from 'database/models';
import { UserRole } from 'database/models';
import { ROLES } from 'utils/constants';

const userService = {};

userService.getUserByEmail = async (email) => {
  return await User.findOne({
    where: {
      email,
    },
  });
};

userService.createUser = async (userBody) => {
  if (await User.isEmailTaken(userBody.email)) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }
  const user = await User.create(userBody);
  const roleId = await Role.findRoleIdByName(ROLES.STUDENT);
  await UserRole.create({ userId: user.id, roleId });
  return user;
};

userService.getRolesFromId = async (id) => {
  const user = await User.findOne({
    include: {
      model: Role,
    },
    where: {
      id,
    },
  });
  const roles = user.Roles.map((role) => role.name);
  return roles;
};

export default userService;
