export type contracts = 'CDI' | 'alternance' | 'freelance' | 'stage' | 'CDD' | 'interim';

export type graduations = 'doctorat' | 'master' | 'licence' | 'bac+2' | 'bac' | 'CAP/BEP';

export type site = 'FranceTravail' | 'HelloWork' | 'Indeed' | 'JobTeaser' | 'LesJeudis' | 'LinkedIn' | 'Monster' | 'TheJungler' | 'MeteoJob';

interface salary {
  mensural: number;
  annual: number;
}

type homeWork = 'full' | 'medium' | 'low' | false;

// https://www.hellowork.com/fr-fr/emploi/recherche.html?k=développeur+web&l=Essonne&l_autocomplete=http%3A%2F%2Fwww.rj.com%2Fcommun%2Flocalite%2Fdepartement%2F91&c=CDI&msa=25000&d=all
// https://www.hellowork.com/fr-fr/emploi/recherche.html?k=d%C3%A9veloppeur%20web&l=essonne+91&l_autocomplete=http%3A%2F%2Fwww.rj.com%2Fcommun%2Flocalite%2Fcommune%2FD&d=all&c=CDI&msa=25000&
