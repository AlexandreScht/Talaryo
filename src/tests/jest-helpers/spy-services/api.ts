import type { APIServicesJest } from '@/interfaces/jest';
import ApiServiceFile from '@/services/api';
import Container from 'typedi';

export default function apiMockedService(): APIServicesJest {
  const ApiService = Container.get(ApiServiceFile);

  const updateBrevoUser = jest.spyOn(ApiService, 'UpdateBrevoUser');
  const createBrevoUser = jest.spyOn(ApiService, 'CreateBrevoUser');
  const FetchMailRequestId = jest.spyOn(ApiService, 'FetchMailRequestId');
  const FetchMailData = jest.spyOn(ApiService, 'FetchMailData');
  const SendSignalHireRequest = jest.spyOn(ApiService, 'SendSignalHireRequest');

  return {
    updateBrevoUser,
    createBrevoUser,
    FetchMailRequestId,
    FetchMailData,
    SendSignalHireRequest,
  };
}
