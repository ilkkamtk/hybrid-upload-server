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
  // since using a bit hacky way to get the filename from body, make sure that no injections are made
  if (request.body.newFilename) {
    cb(null, false);
  }

  if (file.mimetype.includes('image') || file.mimetype.includes('video')) {
    // Append user_id to the random filename
    const userId = request.body.user?.user_id;
    if (userId) {
      const extension = file.originalname.split('.').pop();
      const newFilename = `${file.filename}_${userId}.${extension}`;
      file.filename = newFilename;
      request.body.newFilename = newFilename; // Store the new filename in req.body
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
