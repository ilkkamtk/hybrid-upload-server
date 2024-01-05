import {Request, Response, NextFunction} from 'express';
import CustomError from '../../classes/CustomError';
import jwt from 'jsonwebtoken';
import {User} from '../../interfaces/User';
import fs from 'fs';
import {FileInfo} from '../../interfaces/FileInfo';

const uploadFile = async (
  req: Request,
  res: Response<{}, {user: User}>,
  next: NextFunction
) => {
  try {
    if (!req.file) {
      const err = new CustomError('file not valid', 400);
      next(err);
      return;
    }
    const fileInfo: FileInfo = {
      filename: req.file.filename,
      user_id: res.locals.user.id,
    };

    const filename = jwt.sign(fileInfo, process.env.JWT_SECRET as string);

    // change file name of req.file.path to filename
    fs.renameSync(req.file.path, `${req.file.destination}/${filename}`);
    // if thumbnail exists, change thumbnail name of req.file.path + '_thumb' to filename + '_thumb'
    if (fs.existsSync(`${req.file.path}-thumb.png`)) {
      fs.renameSync(
        `${req.file.path}-thumb.png`,
        `${req.file.destination}/${filename}-thumb.png`
      );
    }

    const response = {
      message: 'file uploaded',
      data: {
        filename,
      },
    };
    res.json(response);
  } catch (error) {
    next(new CustomError((error as Error).message, 400));
  }
};

const deleteFile = async (
  req: Request<{filename: string}>,
  res: Response<{}, {user: User}>,
  next: NextFunction
) => {
  try {
    const filename = req.params.filename;
    if (!filename) {
      const err = new CustomError('filename not valid', 400);
      next(err);
      return;
    }

    // check if not admin
    if (res.locals.user.role !== 'Admin') {
      // check from token if user is owner of file
      const decodedTokenFromFileName = jwt.verify(
        filename,
        process.env.JWT_SECRET as string
      ) as FileInfo;

      if (decodedTokenFromFileName.user_id !== res.locals.user.id) {
        const err = new CustomError('user not authorized', 401);
        next(err);
        return;
      }
    }

    // delete  from uploads folder
    if (fs.existsSync(`./uploads/${filename}-thumb.png`)) {
      fs.unlinkSync(`./uploads/${filename}-thumb.png`);
    }

    if (!fs.existsSync(`./uploads/${filename}`)) {
      const err = new CustomError('file not found', 404);
      next(err);
      return;
    }

    fs.unlinkSync(`./uploads/${filename}`);

    const response = {
      message: 'file deleted',
      data: {
        filename,
      },
    };
    res.json(response);
  } catch (error) {
    next(new CustomError((error as Error).message, 400));
  }
};

export {uploadFile, deleteFile};
