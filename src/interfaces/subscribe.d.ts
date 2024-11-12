import { cancelStripeOptions } from './payement';
import { role } from './users';

type subscribe_status = 'active' | 'pending' | 'disable' | 'waiting';
type billing_type = 'Renouvellement' | 'Souscription' | 'Changement';
type recurring_type = 'par Trimestre' | 'par Mois' | 'par An';
type recurring_short_type = 'Mensuel' | 'Annuel' | 'Trimestriel';
interface cancelSubType {
  subId: string;
  options: cancelStripeOptions | undefined;
}

interface invoicesProps {
  price: number;
  billing: billing_type;
  pdf: string;
  url: string;
  paid: boolean;
  plan: role;
  start: Date;
  recurring: recurring_type;
}
