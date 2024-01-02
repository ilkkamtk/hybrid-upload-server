/* eslint-disable @typescript-eslint/no-unused-vars */
import {NextFunction, Request, Response} from 'express';
import ErrorResponse from './interfaces/ErrorResponse';
import CustomError from './classes/CustomError';
import sharp from 'sharp';
import jwt from 'jsonwebtoken';
import {User} from './interfaces/User';

const notFound = (req: Request, res: Response, next: NextFunction) => {
  const error = new CustomError(`🔍 - Not Found - ${req.originalUrl}`, 404);
  next(error);
};

const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction
) => {
  console.error('errorHandler', err);
  res.status(err.status || 500);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};

const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log('authenticate');
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      next(new CustomError('Authentication failed', 401));
      return;
    }
    const token = authHeader.split(' ')[1];
    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as User;
    console.log(decodedToken);
    if (!decodedToken) {
      next(new CustomError('Authentication failed', 401));
      return;
    }
    res.locals.user = decodedToken;
    next();
  } catch (error) {
    next(new CustomError('Authentication failed', 401));
  }
};

const makeThumbnail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    console.log(req.file?.path);
    await sharp(req.file?.path)
      .resize(160, 160)
      .png()
      .toFile(req.file?.path + '_thumb');
    next();
  } catch (error) {
    next(new CustomError('Thumbnail not created', 500));
  }
};

export {notFound, errorHandler, authenticate, makeThumbnail};
