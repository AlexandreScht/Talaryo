import config from '@/config';
import { InvalidArgumentError } from '@/exceptions';
import crypto from 'crypto';
import { v4 as uuid } from 'uuid';
const {
  security: { ACCESS_TOKEN },
} = config;

export function setKeyToken(value: string) {
  try {
    const token1 = uuid().replace(/-/g, '');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-128-cbc', Buffer.from(ACCESS_TOKEN, 'hex').slice(0, 16), iv);
    const encrypted = Buffer.concat([cipher.update(`${token1}|:|${value}`), cipher.final()]);
    // [token, encrypted]
    return [token1, iv.toString('hex') + '.' + encrypted.toString('hex')];
  } catch (error) {
    throw new InvalidArgumentError();
  }
}

export function getKeyToken(value: string) {
  try {
    const textParts = value.split('.');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join('.'), 'hex');
    const decipher = crypto.createDecipheriv('aes-128-cbc', Buffer.from(ACCESS_TOKEN, 'hex').slice(0, 16), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    // [token, value]
    return decrypted.toString().split('|:|');
  } catch (error) {
    throw new InvalidArgumentError();
  }
}
