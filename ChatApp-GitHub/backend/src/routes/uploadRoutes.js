import { Router } from 'express';
import multer from 'multer';
import { uploadImage } from '../lib/supabaseStorage.js';

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(file.mimetype.toLowerCase());
    if (extname) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes'));
    }
  },
});

router.post('/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
    }

    const userId = req.user?.id || 'anonymous';
    const result = await uploadImage(req.file, userId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('[upload/image]', error);
    res.status(500).json({ error: 'Error al subir la imagen' });
  }
});

export default router;