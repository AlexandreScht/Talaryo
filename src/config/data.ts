import { cancelProps } from '@/interfaces/payement';
import { abonnement } from '@/interfaces/users';

export const roles: abonnement[] = [
  { label: 'admin', value: 'admin' },
  { label: 'business', value: 'business' },
  { label: 'pro', value: 'pro' },
  { label: 'free', value: 'free' },
];

export const Cancellation_choice: cancelProps[] = [
  {
    label: 'Le service client est insatisfaisant',
    value: 'customer_service',
  },
  {
    label: 'La qualité est inférieure aux attentes',
    value: 'low_quality',
  },
  {
    label: "Il n'y a pas assez de contenu",
    value: 'missing_features',
  },
  {
    label: "Prix de l'abonnement trop éléver",
    value: 'too_expensive',
  },
  {
    label: "Je n'utilise pas assez l'abonnement",
    value: 'unused',
  },
  {
    label: 'Autre',
    value: 'other',
  },
];
