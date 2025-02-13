import express, {NextFunction, Request, Response} from 'express';
import {deleteFile, uploadFile} from '../controllers/uploadController';
import multer from 'multer';
import {addUserToBody, authenticate, makeThumbnail} from '../../middlewares';
import CustomError from '../../classes/CustomError';
import {TokenContent} from 'hybrid-types/DBTypes';

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    const userId = req.body.user.user_id;
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
  console.log('doUpload', req.body);
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

router
  .route('/upload')
  .post(authenticate, addUserToBody, doUpload, makeThumbnail, uploadFile);

router.route('/delete/:filename').delete(authenticate, deleteFile);

export default router;
