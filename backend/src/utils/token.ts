import jwt, { SignOptions, VerifyErrors, VerifyOptions } from 'jsonwebtoken';
import User from '../interfaces/user.interface';
import Token from '../interfaces/token.interface';

export const createToken = (user: User): string => {
  const payload = { id: user._id };
  const secret = process.env.JWT_SECRET as string;
  const options: SignOptions = { algorithm: 'HS256', expiresIn: '1d' };

  return jwt.sign(payload, secret, options);
};

export const verifyToken = async (token: string): Promise<Token> => {
  const secret = process.env.JWT_SECRET as string;
  const options: VerifyOptions = { algorithms: ['HS256'] };

  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, options, (err: VerifyErrors | null, payload) => {
      if (err) return reject(err);
      resolve(payload as Token);
    });
  });
};

export default { createToken, verifyToken };