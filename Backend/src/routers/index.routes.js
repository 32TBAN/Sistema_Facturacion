import {Router} from 'express'
import product from '../models/Product'

const router = Router()

router.get("/",(req,res)=>{
    res.send("backend")
})

router.get("/product/add",async (req,res)=>{
            product.create(
            {
                productID:  '01',
                name: 'Teclado',
                categoryID: 1,
                quantityPerUnit: '1x',
                unitPrice: 29.99,
                unitStock: 100,
            }
        )
    
    res.send("saved")
})

export default router