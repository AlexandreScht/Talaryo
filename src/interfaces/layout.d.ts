import { userPayload } from './users';

interface menuItems {
  icon: React.ReactNode;
  label: string;
  route: string | string[] | null;
  plan: role;
}

interface externeItems {
  icon: React.ReactNode;
  label: string;
  route: string;
}

type externeItems = {
  icon: React.ReactNode;
  label: string;
  route: string;
};

type mainPropsA = {
  User: userPayload;
  menuItems?: never;
  externeItems: externeItems[];
  children?: React.ReactNode;
  className?: string;
};

type mainPropsB = {
  User: userPayload;
  menuItems: menuItems[];
  externeItems?: never;
  children?: React.ReactNode;
  className?: string;
};

type mainProps = mainPropsA | mainPropsB;

interface menuDownItems {
  label: string;
  action: string;
}
