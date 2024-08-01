const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const categorySchema = new mongoose.Schema(
  {
    cName: {
      type: String,
      required: true,
    },
    cDescription: {
      type: String,
      required: true,
    },
    cImage: {
      type: String,
    },
    cStatus: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const customizeSchema = new mongoose.Schema(
  {
    slideImage: {
      type: String,
    },
    firstShow: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const orderSchema = new mongoose.Schema(
  {
    allProduct: [
      {
        id: { type: ObjectId, ref: "products" },
        quantitiy: Number,
      },
    ],
    user: {
      type: ObjectId,
      ref: "users",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: "Order placed",
      enum: [
        "Order placed",
        "Shipped",
        "Delivered",
        "Cancelled",
      ],
    },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    pName: {
      type: String,
      required: true,
    },
    pDescription: {
      type: String,
      required: true,
    },
    pPrice: {
      type: Number,
      required: true,
    },
    pSold: {
      type: Number,
      default: 0,
    },
    pQuantity: {
      type: Number,
      default: 0,
    },
    pCategory: {
      type: ObjectId,
      ref: "categories",
    },
    pImages: {
      type: Array,
      required: true,
    },
    pOffer: {
      type: String,
      default: null,
    },
    pRatingsReviews: [
      {
        review: String,
        user: { type: ObjectId, ref: "users" },
        rating: String,
        createdAt: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
    pStatus: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      maxlength: 32,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      index: { unique: true },
      match: /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/,
    },
    password: {
      type: String,
      required: true,
    },
    userRole: {
      type: Number,
      required: true,
    },
    phoneNumber: {
      type: Number,
    },
    userImage: {
      type: String,
      default: "user.png",
    }
  },
  { timestamps: true }
);

const userModel = mongoose.model("users", userSchema, "users");
const categoryModel = mongoose.model("categories", categorySchema);
const productModel = mongoose.model("products", productSchema);
const customizeModel = mongoose.model("customizes", customizeSchema);
const orderModel = mongoose.model("orders", orderSchema);



module.exports = {
    userModel,
    categoryModel,
    productModel,
    customizeModel,
    orderModel
};
