const Product = require('../models/product');


const ErrorHandler = require('../utils/errorHandler');
const catchAsyncErrors = require('../middlewares/catchAsyncErrors');
const APIFeatures = require('../utils/apiFeatures')
const cloudinary = require('cloudinary')


//Creation d'un produit => /api/v1/admin/product/new
exports.newProduct = catchAsyncErrors(async (req,res,next)=>{

    let images = [];
    //checker si il y a des images ou pas
    if(typeof req.body.images === 'string'){
        images.push(req.body.images)//push the image to the array
    }else {
        images = req.body.images//if there is more than one image
    }

    let imagesLinks = [];
    for(let i = 0 ; i < images.length ; i++){
        const result = await cloudinary.v2.uploader.upload(images[i],{
            folder:'Products'
        });

        imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url
        })
    }
    req.body.images = imagesLinks;
    //out of {} because we are not creating a new object
    req.body.user = req.user.id ; 
    //prendre tt les données du body then create the product
    const product = await Product.create(req.body)

    res.status(201).json({
        success: true,
        product
    })
})



//POSTMAN inchallah yamchi 
//Return all products in routes /api/v1/products

exports.getProducts = catchAsyncErrors (async (req,res,next) => {
    
    const resPerPage = 4 ;
    const productsCount = await Product.countDocuments();

    const apiFeatures = new APIFeatures(Product.find(), req.query)
        .search()
        .filter()
        .pagination(resPerPage)

    
    const products = await apiFeatures.query;

       
            res.status(200).json({
                success: true,
                productsCount,
                resPerPage,
                products
            })
})

exports.getAdminProducts = catchAsyncErrors (async (req,res,next) => {

    const products = await Product.find();

    res.status(200).json({
      success: true,
      products
    })
        


})

//single ( :-) ) product data => la route : api/v1/product/:id

exports.getSingleProduct = catchAsyncErrors (async(req, res , next) =>{

    const product = await Product.findById(req.params.id);
    
    if(!product){
        return next(new ErrorHandler('Product not found', 404));
    }
    
    res.status(200).json({
        success: true,
        product
    })
})


//maj du Produit => /api/v1/admin/product/:id
exports.updateProduct = catchAsyncErrors (async (req , res , next) =>{
    
    let product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHandler('Product not found', 404));
    }

    let images = [];
    //checker si il y a des images ou pas
    if(typeof req.body.images === 'string'){
        images.push(req.body.images)//push the image to the array
    }else {
        images = req.body.images//if there is more than one image
    }
    if(images !== undefined){
        //Delete images associated with the product
        for(let i = 0 ; i < product.images.length ; i++){
            const result = await cloudinary.v2.uploader.destroy(product.images[i].public_id)
        }

        let imagesLinks = [];
        for(let i = 0 ; i < images.length ; i++){
        const result = await cloudinary.v2.uploader.upload(images[i],{
            folder:'Products'
        });

        imagesLinks.push({
            public_id: result.public_id,
            url: result.secure_url
        })
    }
        req.body.images = imagesLinks;



    }

    
    product = await Product.findByIdAndUpdate(req.params.id, req.body,{
        new: true,
        runValidators: true,
        useFindAndModify: false
    }); 

    res.status(200).json({
        success: true,
        product
    })
})


//Delete Product => /api/v1/admin/product/:id

exports.deleteProduct = catchAsyncErrors (async (req , res, next) =>{

    const product = await Product.findById(req.params.id);

    if(!product){
        return next(new ErrorHandler('Product not found', 404));
    }

    //Delete images associated with the product
    for(let i = 0 ; i < product.images.length ; i++){
       const result = await cloudinary.v2.uploader.destroy(product.images[i].public_id)
    }

    await product.deleteOne();

    res.status(200).json({  
        success: true,
        message:'Product is deleted.'
    })
})


//Create new Review => /api/v1/review
exports.createProductReview = catchAsyncErrors ( async(req,res , next)=>{

    const{ rating , comment , productId } = req.body;

    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    }

    const product = await Product.findById(productId);
    
    //Checker si c'est un commentaire ou pas 
    const isReviewed = product.reviews.find(
        r => r.user.toString() === req.user._id.toString()
    )
    // si oui : 
    // Update the reviews
    if(isReviewed) { 
        product.reviews.forEach(review => {
            if(review.user.toString() === req.user._id.toString()){
                review.comment = comment;
                review.rating = rating;
            }
        })
    //Sinon :
    //push the newest review
    }else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length
    }

    //reduce : accepte multiple values -> One review 
    product.ratings = product.reviews.reduce((acc, item) => item.rating + acc,0) / product.reviews.length
    
    await product.save({ validateBeforeSave : false });

    res.status(200).json({
        success: true
    })

})

//Get product Reviews => /api/v1/reviews
exports.getProductReviews = catchAsyncErrors (async (req,res,next)=>{
    const product = await Product.findById(req.query.id);

    res.status(200).json({
        success: true,
        reviews:product.reviews
    })
})



//Delete product Reviews => /api/v1/reviews
exports.deleteReview = catchAsyncErrors (async (req,res,next)=>{
    const product = await Product.findById(req.query.productId);

    //filtrer les produits qui ont un id qui correspend to the comment section
    const reviews = product.reviews.filter(review => review._id.toString() !== req.query.id.toString());

    const numOfReviews = reviews.length;

    const ratings = product.reviews.reduce((acc, item) => item.rating + acc,0) / reviews.length

    await Product.findByIdAndUpdate(req.query.productId,{
        reviews,
        ratings,
        numOfReviews
    }, {
        new:true,
        runValidators: true,
        useFindAndModify:false
    })    

    res.status(200).json({
        success: true
    })
})

