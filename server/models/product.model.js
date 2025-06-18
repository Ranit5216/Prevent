import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name : {
        type : String,
    },
    image : {
        type : Array,
        default : []
    },
    category : [
        {
            type : mongoose.Schema.ObjectId,
            ref : 'category'
        }
    ],
    subCategory : [
        {
            type : mongoose.Schema.ObjectId,
            ref : 'subCategory'
        }
    ],
    unit : {
        type : String,
        default : ""
    },
    stock : {
        type : Number,
        default : 0
    },
    price : {
        type : Number,
        default : null
    },
    discount : {
        type : Number,
        default : null
    },
    description : {
        type : String,
        default : ""
    },
    more_details : {
        type : Object,
        default : {}
    },
    public : {
        type : Boolean,
        default : true
    },
    admin_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        require: true
    },
    admin_info: {
        name: String,
        facebookLink: String,
        youtubeLink: String,
        instagramLink: String
    }

},{
    timestamps : true
})

//create a text index
productSchema.index({
    name: "text",
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 4ad07c39714336a0b480684a7675a2fa7c822fa9
    description: "text",
}, {
    weights: {
        name: 10,
        description: 5,
<<<<<<< HEAD
=======
=======
    description: "text"
}, {
    weights: {
        name: 10,
        description: 5
>>>>>>> 3dc8716a5f1b9afee4f3f4c58afce981c5e6691c
>>>>>>> 4ad07c39714336a0b480684a7675a2fa7c822fa9
    }
})


const ProductModel = mongoose.model('product',productSchema)

// Recreate text index
ProductModel.collection.dropIndexes()
  .then(() => {
    return ProductModel.collection.createIndex(
      { name: "text", description: "text" },
<<<<<<< HEAD
      { weights: { name: 10, description: 5} }
=======
<<<<<<< HEAD
      { weights: { name: 10, description: 5} }
=======
      { weights: { name: 10, description: 5 } }
>>>>>>> 3dc8716a5f1b9afee4f3f4c58afce981c5e6691c
>>>>>>> 4ad07c39714336a0b480684a7675a2fa7c822fa9
    );
  })
  .then(() => {
    console.log('Text index created successfully');
  })
  .catch(err => {
    console.error('Error creating text index:', err);
  });

export default ProductModel