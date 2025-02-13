import express, {NextFunction, Request, Response} from 'express';
import {deleteFile, uploadFile} from '../controllers/uploadController';
import multer from 'multer';
import {authenticate, makeThumbnail} from '../../middlewares';
import CustomError from '../../classes/CustomError';
import {TokenContent} from 'hybrid-types/DBTypes';

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    // Get user from res.locals instead of req.body
    const userId = (req as Request).res?.locals.user.user_id;
    const extension = file.originalname.split('.').pop();
    const newFilename = `${file.fieldname}_${userId}.${extension}`;
    cb(null, newFilename);
  },
});

const upload = multer({storage}).single('file');

const doUpload = (
  req: Request,
  res: Response<unknown, {user: TokenContent}>,
  next: NextFunction,
) => {
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
      next();
    }
  });
};

const router = express.Router();

router.route('/upload').post(authenticate, doUpload, makeThumbnail, uploadFile);

router.route('/delete/:filename').delete(authenticate, deleteFile);

export default router;
