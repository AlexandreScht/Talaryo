import { UserServicesJest } from '@/interfaces/jest';
import UserServiceFile from '@/services/users';
import Container from 'typedi';

export default function userMockedService(): UserServicesJest {
  const UserService = Container.get(UserServiceFile);

  const findUsers = jest.spyOn(UserService, 'findUsers');
  const updateUsers = jest.spyOn(UserService, 'updateUsers');
  const generateCodeAccess = jest.spyOn(UserService, 'generateCodeAccess');
  const generateTokenAccess = jest.spyOn(UserService, 'generateTokenAccess');
  const getUser = jest.spyOn(UserService, 'getUser');
  const presetNewPassword = jest.spyOn(UserService, 'presetNewPassword');

  return {
    findUsers,
    updateUsers,
    generateCodeAccess,
    generateTokenAccess,
    getUser,
    presetNewPassword,
  };
}
