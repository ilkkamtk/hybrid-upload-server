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
      throw err;
    }

    const fileInfo: FileInfo = {
      filename: req.file.filename,
      user_id: res.locals.user.id,
    };

    const filename = jwt.sign(fileInfo, process.env.JWT_SECRET as string);

    // change file name of req.file.path to filename
    fs.renameSync(req.file.path, `${req.file.destination}/${filename}`);

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
      throw err;
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
        throw err;
      }
    }

    // delete  from uploads folder
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
