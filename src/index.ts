import multer from '@koa/multer';
import koa from 'koa';
import Router from 'koa-router';
import { customAlphabet } from 'nanoid/non-secure';
import path from 'path';
import cors from '@koa/cors';

const app = new koa();
const router = new Router();
const nanoid = customAlphabet(
  '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
  8
);
const uploadPath =
  process.env !== undefined
    ? path.resolve('upload')
    : path.resolve('/var/www/tou/upload');

app.use(cors({ origin: '*' }));
app.use(async (context, next) => {
  try {
    await next();
  } catch (error) {
    error.status = error.statusCode || error.status || 500;
    context.body = { status: error.status, message: error.message };
    context.app.emit('error', error, context);
  }
});

const storage = multer.diskStorage({
  destination: (request, file, callback) => {
    callback(null, uploadPath);
  },
  filename: (request, file, callback) => {
    callback(null, `${nanoid()}.${file.mimetype.split('/').pop()}`);
  },
});
const upload = multer({
  fileFilter: (request, file, callback) => {
    if (!RegExp('^image\\/(bmp|gif|jpeg|png|x\\-icon)+$').test(file.mimetype)) {
      return callback(new Error('Unsupported file type'), false);
    }
    callback(null, true);
  },
  limits: { files: 5, fileSize: 5 * 1024 * 1024 },
  storage: storage,
});

router.get('/', (context) => {
  context.body = '🌚🌝🌚🌝';
});

router.post('/upload', upload.array('image', 5), async (context) => {
  context.body = JSON.stringify(
    // @ts-ignore
    {
      status: 200,
      images: context.request.files.map((file) => ({
        url: `https://tou.im/i/${file.filename}`,
      })),
    },
    undefined,
    2
  );
});

app.use(router.routes());
app.listen(3000);
