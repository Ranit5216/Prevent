import ProductModel from "../models/product.model.js";
import UserModel from "../models/user.model.js";

export const createProductController = async(request,response)=>{
    try {
        const { 
            name ,
            image ,
            category,
            subCategory,
            unit,
            stock,
            price,
            discount,
            description,
            more_details,
        } = request.body 

        if(!name || !image[0] || !category[0] || !subCategory[0] || !unit || !price || !description ){
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
            category,
            subCategory,
            unit,
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
                    select: 'name facebookLink youtubeLink instagramLink'
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

        return response.json({
            message : "Product data",
            error : false,
            success : true,
            totalCount : totalCount,
            totalNoPage : Math.ceil( totalCount / limit),
            data : productsWithAdminInfo
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
        }).limit(15)

        return response.json({
            message : "category product list",
            data : product,
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
            ProductModel.find(query).sort({createdAt : -1 }).skip(skip).limit(limit),
            ProductModel.countDocuments(query)
        ])

        return response.json({
            message : "Product list",
            data : data,
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
                select: 'name facebookLink youtubeLink instagramLink'
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

        return response.json({
            message : "Product details",
            data : productObj,
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
        let { search, page , limit } = request.body 

        if(!page){
            page = 1
        }
        if(!limit){
            limit  = 10
        }

        const query = search ? {
            $text : {
                $search : search
            }
        } : {}

        const skip = ( page - 1) * limit

        const [data,dataCount] = await Promise.all([
            ProductModel.find(query).sort({ createdAt  : -1 }).skip(skip).limit(limit).populate('category subCategory'),
            ProductModel.countDocuments(query)
        ])

        return response.json({
            message : "Product data",
            error : false,
            success : true,
            data : data,
            totalCount :dataCount,
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