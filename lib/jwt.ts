/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt from "jsonwebtoken";

const SECRET = "dummy-secret";

export function signToken(payload: any) {
  return jwt.sign(payload, SECRET, {
    expiresIn: "1d",
  });
}
