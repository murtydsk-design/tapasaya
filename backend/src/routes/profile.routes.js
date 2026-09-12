const express = require('express');
const router = express.Router();
const path = require('path');
const multer = require('multer');
const profileController = require('../controllers/profile.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/avatars'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const uniqueName = `user_${req.user.id}_${Date.now()}_${Math.floor(Math.random() * 10000)}${ext}`;
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const err = new Error('Please choose an image file.');
    err.statusCode = 400;
    cb(err, false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.use(authenticateToken);

router.get('/', profileController.getProfile);
router.put('/', profileController.updateProfile);
router.patch('/avatar', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'Image is too large. Please choose a smaller image.'
        });
      }
      return res.status(err.statusCode || 400).json({
        success: false,
        message: err.message || 'Please choose an image file.'
      });
    }
    next();
  });
}, profileController.updateAvatar);

module.exports = router;
