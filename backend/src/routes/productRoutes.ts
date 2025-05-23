import { Router } from 'express';
import {
    getRelatedProducts,
    getRelatedProductsByProductID,
    getRetailerProduct,
    getRetailerProductPricingData
} from '../controllers/productController'

const router = Router();

router.get('/retailer-product', getRetailerProduct);
router.get('/retailer-product-pricing-data', getRetailerProductPricingData);
router.get('/related', getRelatedProducts);
router.get('/relatedByProductId', getRelatedProductsByProductID);

export default router;