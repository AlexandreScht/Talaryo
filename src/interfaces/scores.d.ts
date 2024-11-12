type scoreType = 'mails' | 'profils' | 'searches' | 'cv';
type scoreKeySearchType = 'searches' | 'mails' | 'favorisSave' | 'searchSave';

interface scoreProps {
  column: scoreType;
  count?: number;
}

interface scorePropsFetched {
  searches: number;
  profils: number;
}

interface scoreFetched {
  isCurrentData: boolean;
  score: scorePropsFetched[];
}

interface totalScoreGraph {
  totalSearches: string;
  totalProfiles: string;
}

interface scores {
  searches: number;
  profils: number;
  year: number;
  month: number;
  day: number;
}
interface fetchedScore {
  scores: scores[];
  meta: totalScoreGraph;
}

export interface graphScore {
  lastScores?: totalScoreGraph;
  fetchedScore: fetchedScore;
}

interface dataGraph {
  scores: scores[];
  min: onlyDateSelect;
  max: onlyDateSelect;
}

interface graphicData {
  totalSearches: number;
  totalProfiles: number;
  profileScore: number | null;
  searchScore: number | null;
  dataGraph: dataGraph;
}

export interface oldScore {
  totalSearches: number;
  totalProfils: number;
}

type visited = { profile: number; cv: number };
