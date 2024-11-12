import { role } from './users';

export interface HomeCard {
  icon: react.DetailedReactHTMLElement<
    react.HTMLAttributes<HTMLElement>,
    HTMLElement
  >;
  title: string;
  desc: string;
  txt: string;
  role: role;
  route: string;
  pack: 'Free' | 'Pro' | 'Business';
}
