const express = require("express");
const Product = require("../models/Product");
const {protect, admin} = require("../middleware/authMiddleware");

const router = express.Router();

// @router GET /api/admin/products
// @desc Get all products (Admin only)
// @access Private/Admin
router.get("/",protect,admin,async(req,res)=>{
    try{
        const products = await Product.find({});
        res.json(products);
    }catch(error){
        console.error(error);
        res.status(500).json({message:"Server error"});
    }
});

// @route POST /api/admin/products
// @desc Create a new product (Admin only)
// @access Private/Admin
router.post("/",protect,admin,async(req,res)=>{
    try{
        const {name, description, price, sku, category, brand, sizes, colors, collections, material, gender, images, countInStock} = req.body;
        const product = new Product({
            name,
            description, 
            price, 
            sku, 
            category, 
            brand, 
            sizes, 
            colors, 
            collections, 
            material, 
            gender, 
            images, 
            countInStock,
            user: req.user._id
        });
        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    }catch(error){
        console.error(error);
        res.status(500).json({message:"Server error"});
    }
});

// @route PUT /api/admin/products/:id
// @desc Update a product (Admin only)
// @access Private/Admin
router.put("/:id",protect,admin,async(req,res)=>{
    try{
        const product = await Product.findById(req.params.id);
        if(product){
            product.name = req.body.name || product.name;
            product.description = req.body.description || product.description;
            product.price = req.body.price || product.price;
            product.sku = req.body.sku || product.sku;
            product.category = req.body.category || product.category;
            product.brand = req.body.brand || product.brand;
            product.sizes = req.body.sizes || product.sizes;
            product.colors = req.body.colors || product.colors;
            product.collections = req.body.collections || product.collections;
            product.material = req.body.material || product.material;
            product.gender = req.body.gender || product.gender;
            product.images = req.body.images || product.images;
            product.countInStock = req.body.countInStock || product.countInStock;

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        }else{
            res.status(404).json({message:"Product not found"});
        }
    }catch(error){
        console.error(error);
        res.status(500).json({message:"Server error"});
    }
});

// @route DELETE /api/admin/products/:id
// @desc Delete a product (Admin only)
// @access Private/Admin
router.delete("/:id",protect,admin,async(req,res)=>{
    try{
        const product = await Product.findById(req.params.id);
        if(product){
            await product.deleteOne();
            res.json({message:"Product removed"});
        }else{
            res.status(404).json({message:"Product not found"});
        }
    }catch(error){
        console.error(error);
        res.status(500).json({message:"Server error"});
    }
});

module.exports = router;