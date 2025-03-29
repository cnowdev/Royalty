import { Router } from 'express';
import {
    searchCoupons
} from '../controllers/couponController'

const router = Router();

router.get('/search', searchCoupons);

export default router;