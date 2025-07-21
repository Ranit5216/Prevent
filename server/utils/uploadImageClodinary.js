import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name : process.env.CLODINARY_CLOUD_NAME,
    api_key : process.env.CLODINARY_API_KEY,
    api_secret : process.env.CLODINARY_API_SECRET_KEY 
})

const uploadImageClodinary = async(file)=>{
    const buffer = file?.buffer || Buffer.from(await file.arrayBuffer())

    const uploadFile = await new Promise((resolve,reject)=>{
        cloudinary.uploader.upload_stream({ folder : "Prevent", resource_type: "auto" },(error,uploadResult)=>{
            return resolve(uploadResult)
        }).end(buffer)
    })

    return uploadFile
}

export default uploadImageClodinary