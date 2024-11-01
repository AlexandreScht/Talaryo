import type { AuthServicesJest } from '@/interfaces/jest';
import AuthServiceFile from '@/services/auth';

import Container from 'typedi';

export default function authMockedService(): AuthServicesJest {
  const AuthService = Container.get(AuthServiceFile);

  const login = jest.spyOn(AuthService, 'login');
  const register = jest.spyOn(AuthService, 'register');

  return {
    login,
    register,
  };
}
