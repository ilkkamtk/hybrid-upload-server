import express, {Request} from 'express';
import {deleteFile, uploadFile} from '../controllers/uploadController';
import multer, {FileFilterCallback} from 'multer';
import {
  authenticate,
  makeThumbnail,
  attachUserToRequest,
} from '../../middlewares';

const fileFilter = (
  request: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback,
) => {
  console.log('file', file);
  if (file.mimetype.includes('image') || file.mimetype.includes('video')) {
    // Append user_id to the random filename
    const userId = request.body.user?.user_id;
    if (userId) {
      const extension = file.originalname.split('.').pop();
      file.filename = `${file.filename}_${userId}.${extension}`;
    }
    cb(null, true);
  } else {
    cb(null, false);
  }
};
const upload = multer({dest: './uploads/', fileFilter});
const router = express.Router();

router
  .route('/upload')
  .post(
    authenticate,
    attachUserToRequest,
    upload.single('file'),
    makeThumbnail,
    uploadFile,
  );

router.route('/delete/:filename').delete(authenticate, deleteFile);

export default router;
