type role = 'admin' | 'business' | 'pro' | 'free';

type FindUserProps = { email: string; oAuthAccount?: boolean } | { id: number };
type twoFactorType = 'authenticator' | 'email' | null;
