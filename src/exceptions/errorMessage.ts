import logOut from '@/utils/logOut';
import { AxiosError } from 'axios';
import { signOut } from 'next-auth/react';
import * as yup from 'yup';
import { ExpiredSessionError, InvalidRoleAccessError } from '.';

const signOutNextAuth = async () => {
  console.log('deconnexion forcer');
  if (typeof window !== 'undefined') {
    await signOut();
  } else {
    await logOut();
  }
};

const unknownError = "Une erreur inconnue s'est produite.";

export function getErrorMessage(err: unknown): {
  err: string;
  code?: number | string;
} {
  if (err instanceof ExpiredSessionError) {
    signOutNextAuth();
    return {
      err: "Problème d'authentification, vous allez être déconnecté.",
      code: 999,
    };
  }

  if (yup.ValidationError.isError(err)) {
    return {
      err: err.errors[0] ?? unknownError,
      code: 'yup Error',
    };
  }

  if (err instanceof InvalidRoleAccessError) {
    return {
      err: "Veuillez souscrire à une offre d'abonnement supérieure pour continuer",
      code: 'Permissions insuffisantes',
    };
  }

  if (err instanceof AxiosError) {
    return {
      err: err.response?.data?.error ?? unknownError,
      code: err.response?.status,
    };
  }

  if (err instanceof Error) {
    return {
      err: err.message ?? unknownError,
      code: err.name,
    };
  }

  return typeof err === 'string' ? { err } : { err: unknownError };
}
