import { billingPlan } from '@/interfaces/payement';

export const FreePlan: billingPlan = {
  name: 'Free',
  role: 'free',
  description: 'Pour un recrutement efficace et rapide.',
  prices: {
    monthly: undefined,
    trimestrial: undefined,
    annual: undefined,
  },
  list: [
    {
      title: '10 recherches par mois',
      tooltip: 'Environ 50 candidats par recherche',
    },
    {
      title: 'Plateforme LinkedIn',
      tooltip: 'Recherches uniquement sur LinkedIn',
    },
    { title: 'Filtres Primaires', tooltip: '' },
    { title: 'Filtre compétences et mots-clés', tooltip: '' },
    {
      title: '10 talents favoris',
      tooltip: 'Possibilité de sauvegarder les talents',
    },
    { title: '3 recherches enregistrées', tooltip: '' },
  ],
};

export const ProPlan: billingPlan = {
  name: 'Pro',
  role: 'pro',
  description: 'Accélérez la croissance de votre entreprise.',
  prices: {
    monthly: 'pro_monthly',
    trimestrial: 'pro_trimestrial',
    annual: 'pro_annual',
  },
  list: [
    { title: 'Le plan Free', tooltip: '' },
    {
      title: '100 Recherches par mois',
      tooltip: 'Environ 50 candidats par recherche',
    },
    { title: 'Recherche toutes plateformes', tooltip: '' },
    { title: '100 talents favoris', tooltip: '' },
    { title: '10 recherches enregistrées', tooltip: '' },
    { title: 'Export des talents', tooltip: 'Export en fichier CSV' },
    // 'Email Checker Illimité',
  ],
};

export const BusinessPlan: billingPlan = {
  name: 'Business',
  role: 'business',
  description: 'Perfectionnez votre campagne de recrutement.',
  prices: {
    monthly: 'business_monthly',
    trimestrial: 'business_trimestrial',
    annual: 'business_annual',
  },
  list: [
    { title: 'Le plan Avancé', tooltip: '' },
    {
      title: 'Recherches illimitées par mois',
      tooltip: 'Environ 50 candidats par recherche',
    },
    {
      title: 'Alumnis grandes écoles',
      tooltip: 'Tous les mois, de nouvelles écoles sont disponibles',
    },
    { title: 'Talents favoris illimités', tooltip: '' },
    { title: 'Recherches enregistrées illimitées', tooltip: '' },
    { title: 'Accès anticipé aux nouvelles fonctionnalités', tooltip: '' },
    // 'Email Checker Illimité',
    // Automation de pipeline,
    // Automation LinkedIn
    // Support prioritaire
  ],
};
