import jwt, { JwtPayload } from 'jsonwebtoken';
import User from '../models/user';
import { NextFunction, Response, Request } from 'express';

interface DecodedToken extends JwtPayload {
  _id: string;
}

const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.token;
    if (!token) throw new Error();

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your_jwt_secret'
    ) as DecodedToken;

    const user = await User.findOne({
      _id: decoded._id,
      'tokens.token': token,
    });

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    next();
  } catch (e: unknown) {
    if (e instanceof Error) {
      res.status(401).send({ error: 'Please authenticate.' });
    }
  }
};

export default auth;
