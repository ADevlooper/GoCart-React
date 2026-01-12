import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
const JWT_SECRET = process.env.JWT_SECRET || "Randomizer202";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "10d";

export const hashPassword = async (plain) => {
  return await bcrypt.hash(plain, SALT_ROUNDS);
};

export const comparePassword = async (plain, hashed) => {
  return await bcrypt.compare(plain, hashed);
};

export const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};
