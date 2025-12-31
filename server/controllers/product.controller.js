import ProductModel from "../models/product.model.js";
import UserModel from "../models/user.model.js";

// Helper function to add rating data to products
const addRatingDataToProducts = async (products) => {
    try {
        if (!products || products.length === 0) {
            return []
        }

        const ReviewModel = (await import('../models/review.model.js')).default
        
        // Convert products to objects and extract IDs
        const productObjects = products.map(p => p.toObject ? p.toObject() : p)
        const productIds = productObjects.map(p => p._id)

        if (productIds.length === 0) {
            return productObjects.map(p => ({
                ...p,
                averageRating: 0,
                reviewCount: 0
            }))
        }

        // Get average ratings and review counts for all products
        const ratingStats = await ReviewModel.aggregate([
            {
                $match: {
                    productId: { $in: productIds },
                    status: 'active'
                }
            },
            {
                $group: {
                    _id: '$productId',
                    averageRating: { $avg: '$rating' },
                    reviewCount: { $sum: 1 }
                }
            }
        ])

        // Create maps for quick lookup
        const ratingMap = {}
        const reviewCountMap = {}
        ratingStats.forEach(stat => {
            const productId = stat._id.toString()
            ratingMap[productId] = parseFloat(stat.averageRating.toFixed(1))
            reviewCountMap[productId] = stat.reviewCount
        })

        // Add rating data to each product
        return productObjects.map(product => {
            const productId = product._id ? product._id.toString() : product._id
            return {
                ...product,
                averageRating: ratingMap[productId] || 0,
                reviewCount: reviewCountMap[productId] || 0
            }
        })
    } catch (error) {
        console.error('Error adding rating data:', error)
        // Return products without rating data if there's an error
        const productObjects = products.map(p => p.toObject ? p.toObject() : p)
        return productObjects.map(p => ({
            ...p,
            averageRating: 0,
            reviewCount: 0
        }))
    }
}

export const createProductController = async(request,response)=>{
    try {
        const { 
            name ,
            image ,
            video , // add video field
            category,
            subCategory,
            stock,
            price,
            discount,
            description,
            more_details,
        } = request.body 

        if(!name || !image[0] || !category[0] || !subCategory[0] || !price || !description ){
            return response.status(400).json({
                message : "Enter required fields",
                error : true,
                success : false
            })
        }
        const admin_id = request.userId

        // Get admin information
        const admin = await UserModel.findById(admin_id).select('name facebookLink youtubeLink instagramLink')
        if (!admin) {
            return response.status(404).json({
                message: "Admin not found",
                error: true,
                success: false
            })
        }

        const product = new ProductModel({
            name ,
            image ,
            video , // save video field
            category,
            subCategory,
            stock,
            price,
            discount,
            description,
            more_details,
            admin_id,
            admin_info: {
                name: admin.name,
                facebookLink: admin.facebookLink,
                youtubeLink: admin.youtubeLink,
                instagramLink: admin.instagramLink
            }
        })
        const saveProduct = await product.save()

        return response.json({
            message : "Product Created Successfully",
            data : saveProduct,
            error : false,
            success : true
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const getProductController = async (request,response)=>{
    try {
        
        let { page, limit, search } = request.body 
        const admin_id = request.userId
        console.log(request.userId)
        if(!page){
            page = 1
        }

        if(!limit){
            limit = 10
        }
        const query = search ? {
            admin_id,
            $text : {
                $search : search
            }
        } : {
            admin_id
        }

        const skip = (page - 1) * limit

        const [data,totalCount] = await Promise.all([
            ProductModel.find(query)
                .sort({createdAt : -1 })
                .skip(skip)
                .limit(limit)
                .populate('category subCategory')
                .populate({
                    path: 'admin_id',
                    select: 'name avatar location facebookLink youtubeLink instagramLink'
                }),
            ProductModel.countDocuments(query)
        ])

        // Add admin info to each product
        const productsWithAdminInfo = data.map(product => {
            const productObj = product.toObject();
            if (product.admin_id) {
                productObj.admin_info = {
                    name: product.admin_id.name,
                    facebookLink: product.admin_id.facebookLink,
                    youtubeLink: product.admin_id.youtubeLink,
                    instagramLink: product.admin_id.instagramLink
                };
            }
            return productObj;
        });

        // Add rating data to products
        const productsWithRatings = await addRatingDataToProducts(productsWithAdminInfo)

        return response.json({
            message : "Product data",
            error : false,
            success : true,
            totalCount : totalCount,
            totalNoPage : Math.ceil( totalCount / limit),
            data : productsWithRatings
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const getProductByCategory = async(request,response)=>{
    try {
        const { id } = request.body 

        if(!id){
            return response.status(400).json({
                message : "provide category id",
                error : true,
                success : false
            })
        }

        const product = await ProductModel.find({ 
            category : { $in : id }
        })
        .limit(15)
        .populate({
            path: 'admin_id',
            select: 'name avatar location facebookLink youtubeLink instagramLink'
        })

        // Add rating data to products
        const productsWithRatings = await addRatingDataToProducts(product)

        return response.json({
            message : "category product list",
            data : productsWithRatings,
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const getProductByCategoryAndSubCategory  = async(request,response)=>{
    try {
        const { categoryId,subCategoryId,page,limit } = request.body

        if(!categoryId || !subCategoryId){
            return response.status(400).json({
                message : "Provide categoryId and subCategoryId",
                error : true,
                success : false
            })
        }

        if(!page){
            page = 1
        }

        if(!limit){
            limit = 10
        }

        const query = {
            category : { $in :categoryId  },
            subCategory : { $in : subCategoryId }
        }

        const skip = (page - 1) * limit

        const [data,dataCount] = await Promise.all([
            ProductModel.find(query)
                .sort({createdAt : -1 })
                .skip(skip)
                .limit(limit)
                .populate({
                    path: 'admin_id',
                    select: 'name avatar location facebookLink youtubeLink instagramLink'
                }),
            ProductModel.countDocuments(query)
        ])

        // Add rating data to products
        const productsWithRatings = await addRatingDataToProducts(data)

        return response.json({
            message : "Product list",
            data : productsWithRatings,
            totalCount : dataCount,
            page : page,
            limit : limit,
            success : true,
            error : false
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

export const getProductDetails = async(request,response)=>{
    try {
        const { productId } = request.body 

        if(!productId){
            return response.status(400).json({
                message : "Provide product id",
                error : true,
                success : false
            })
        }

        const product = await ProductModel.findById(productId)
            .populate('category subCategory')
            .populate({
                path: 'admin_id',
                select: 'name avatar location facebookLink youtubeLink instagramLink'
            })

        if(!product){
            return response.status(404).json({
                message : "Product not found",
                error : true,
                success : false
            })
        }

        // Add admin info to the product
        const productObj = product.toObject();
        if (product.admin_id) {
            productObj.admin_info = {
                name: product.admin_id.name,
                facebookLink: product.admin_id.facebookLink,
                youtubeLink: product.admin_id.youtubeLink,
                instagramLink: product.admin_id.instagramLink
            };
        }

        // Add rating data to product
        const productsWithRatings = await addRatingDataToProducts([product])
        const productWithRating = productsWithRatings[0] || productObj

        return response.json({
            message : "Product details",
            data : productWithRating,
            error : false,
            success : true
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

//update product
export const updateProductDetails = async(request,response)=>{
    try {
        const { _id } = request.body 

        if(!_id){
            return response.status(400).json({
                message : "provide product _id",
                error : true,
                success : false
            })
        }

        const updateProduct = await ProductModel.updateOne({ _id : _id },{
            ...request.body
        })

        return response.json({
            message : "updated successfully",
            data : updateProduct,
            error : false,
            success : true
        })

    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

//delete product
export const deleteProductDetails = async(request,response)=>{
    try {
        const { _id } = request.body 

        if(!_id){
            return response.status(400).json({
                message : "provide _id ",
                error : true,
                success : false
            })
        }

        const deleteProduct = await ProductModel.deleteOne({_id : _id })

        return response.json({
            message : "Delete successfully",
            error : false,
            success : true,
            data : deleteProduct
        })
    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}

//search product
export const searchProduct = async(request,response)=>{
    try {
        let { 
            search, 
            page, 
            limit,
            minPrice,
            maxPrice,
            categoryId,
            subCategoryId,
            minRating,
            hasDiscount,
            sortBy
        } = request.body 

        if(!page){
            page = 1
        }
        if(!limit){
            limit  = 10
        }

        // Build base query
        let query = { public: true }

        // Text search
        if(search){
            query.$text = {
                $search : search
            }
        }

        // Price filter
        if(minPrice || maxPrice){
            query.price = {}
            if(minPrice){
                query.price.$gte = Number(minPrice)
            }
            if(maxPrice){
                query.price.$lte = Number(maxPrice)
            }
        }

        // Category filter
        if(categoryId){
            query.category = { $in: [categoryId] }
        }

        // Subcategory filter
        if(subCategoryId){
            query.subCategory = { $in: [subCategoryId] }
        }

        // Discount filter
        if(hasDiscount === true || hasDiscount === 'true'){
            query.discount = { $exists: true, $ne: null, $gt: 0 }
        }

        const skip = ( page - 1) * limit

        // Build sort options
        let sortOption = { createdAt: -1 } // Default: newest first
        if(sortBy){
            switch(sortBy){
                case 'price_low':
                    sortOption = { price: 1 }
                    break
                case 'price_high':
                    sortOption = { price: -1 }
                    break
                case 'newest':
                    sortOption = { createdAt: -1 }
                    break
                case 'oldest':
                    sortOption = { createdAt: 1 }
                    break
                case 'discount':
                    sortOption = { discount: -1 }
                    break
                default:
                    sortOption = { createdAt: -1 }
            }
        }

        const [data, dataCount] = await Promise.all([
            ProductModel.find(query)
                .sort(sortOption)
                .skip(skip)
                .limit(limit)
                .populate('category subCategory')
                .populate({
                    path: 'admin_id',
                    select: 'name avatar location facebookLink youtubeLink instagramLink'
                }),
            ProductModel.countDocuments(query)
        ])

        // Add rating data to all products
        let productsWithRatings = await addRatingDataToProducts(data)

        // If minRating is specified, filter products by their average rating
        let filteredData = productsWithRatings
        if(minRating){
            filteredData = productsWithRatings.filter(product => {
                const avgRating = product.averageRating || 0
                return avgRating >= Number(minRating)
            })
        }

        return response.json({
            message : "Product data",
            error : false,
            success : true,
            data : filteredData,
            totalCount : dataCount,
            totalPage : Math.ceil(dataCount/limit),
            page : page,
            limit : limit 
        })


    } catch (error) {
        return response.status(500).json({
            message : error.message || error,
            error : true,
            success : false
        })
    }
}