import express from 'express';
import { errorHandler } from './middlewares/errorHandler';
import couponRoutes from './routes/couponRoutes'

const app = express();
app.use(express.json());

app.get('/', (req: any, res: { send: (arg0: string) => void; }) => {
    res.send('Hello, world!');
});

app.use('/coupons', couponRoutes);

app.use(errorHandler);


export default app;