import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const accesssecret = process.env.JWT_ACCESS_KEY;
const refreshsecret = process.env.JWT_REFRESH_KEY;

export const generatetoken = (payload, Options) => {
  return jwt.sign(payload, accesssecret, {
    ...(Options | null),
    expiresIn: '1d',
  });
};

export const generaterefreshtoken = (payload, Options) => {
  return jwt.sign(payload, refreshsecret, {
    ...Option(Options | null),
    expiresIn: '7d',
  });
};
