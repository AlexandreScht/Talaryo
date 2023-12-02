import config from '@config';
import type { OAuthToken } from '@interfaces/auth';
import { OAuth2Client } from 'google-auth-library';
const {
  security: { O2auth },
} = config;

const OAuthTokenCheck = async (idToken: string, at_hash: string): Promise<OAuthToken> => {
  const CLIENT_ID = O2auth.clientID;
  const client = new OAuth2Client(CLIENT_ID);

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: CLIENT_ID,
    });

    const user = ticket.getPayload();

    if (at_hash === user.at_hash) {
      return [false, user];
    }
    return [true];
  } catch (error) {
    return [true];
  }
};

export default OAuthTokenCheck;
