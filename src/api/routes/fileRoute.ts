import express, {NextFunction, Request, Response} from 'express';
import {deleteFile, uploadFile} from '../controllers/uploadController';
import multer from 'multer';
import {authenticate, makeThumbnail} from '../../middlewares';
import CustomError from '../../classes/CustomError';
const upload = multer({dest: './uploads/'}).single('file');

const doUpload = (req: Request, res: Response, next: NextFunction) => {
  console.log('doUpload', res.locals);
  upload(req, res, (err) => {
    if (err) {
      next(new CustomError(err.message, 400));
      return;
    }

    if (
      req.file &&
      (req.file.mimetype.includes('image') ||
        req.file.mimetype.includes('video'))
    ) {
      // Append user_id to the random filename
      const userId = res.locals.user_id;
      if (userId) {
        const extension = req.file.originalname.split('.').pop();
        const newFilename = `${req.file.filename}_${userId}.${extension}`;
        req.file.filename = newFilename;
      }
    }
    next();
  });
};

const router = express.Router();

router.route('/upload').post(authenticate, doUpload, makeThumbnail, uploadFile);

router.route('/delete/:filename').delete(authenticate, deleteFile);

export default router;
