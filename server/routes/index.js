const controller = require('../controller');
const {loginCheck, isAuth, isAdmin} = require("../middleware/auth");
const multer = require("multer");

const basePath = '/api';
const customizeStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/customize');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '_' + file.originalname);
    },
});
const customizeUpload = multer({ storage: customizeStorage });

var categoryStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./public/uploads/categories");
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + "_" + file.originalname);
    },
  });
const categoryUpload = multer({ storage: categoryStorage });
 
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/products');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '_' + file.originalname);
    },
});
const upload = multer({ storage: storage });

module.exports = app => {
    //For signin page
    app.post(`${basePath}/isadmin`, controller.isAdmin);
    app.post(`${basePath}/signup`, controller.postSignup);
    app.post(`${basePath}/signin`, controller.postSignin);
    app.post(`${basePath}/user`, loginCheck, isAuth, isAdmin, controller.allUser);
    //For Category
    app.get(`${basePath}/category/all-category`, controller.getAllCategory);
    app.post(`${basePath}/category/add-category`, loginCheck, categoryUpload.single('cImage'), controller.postAddCategory);
    app.post(`${basePath}/category/edit-category`, loginCheck, controller.postEditCategory);
    app.post(`${basePath}/category/delete-category`, loginCheck, controller.getDeleteCategory);
    //For Customize 
    app.get(`${basePath}/customize/get-slide-image`, controller.getImages);
    app.post(`${basePath}/customize/delete-slide-image`, controller.deleteSlideImage);
    app.post(`${basePath}/customize/upload-slide-image`, customizeUpload.single('image'), controller.uploadSlideImage);
    app.post(`${basePath}/customize/dashboard-data`, controller.getAllData);
    //For Orders
    app.get(`${basePath}/order/get-all-orders`, controller.getAllOrders);
    app.post(`${basePath}/order/create-order`, controller.postCreateOrder);
    app.post(`${basePath}/order/update-order`, controller.postUpdateOrder);
    app.post(`${basePath}/order/delete-order`, controller.postDeleteOrder);
    app.post(`${basePath}/order/order-by-user`, controller.getOrderByUser);
    //For Products
    app.get(`${basePath}/product/all-product`, controller.getAllProduct);
    // app.post(`${basePath}/product/product-by-price`, controller.getProductByPrice);
    app.post(`${basePath}/product/wish-product`, controller.getWishProduct);
    app.post(`${basePath}/product/cart-product`, controller.getCartProduct);
    app.post(`${basePath}/product/add-product`, upload.any(), controller.postAddProduct);
    app.post(`${basePath}/product/edit-product`, upload.any(), controller.postEditProduct);
    app.post(`${basePath}/product/delete-product`, controller.getDeleteProduct);
    app.post(`${basePath}/product/single-product`, controller.getSingleProduct);
    // app.post(`${basePath}/product/add-review`, controller.postAddReview);
    // app.post(`${basePath}/product/delete-review`, controller.deleteReview);
    // app.post(`${basePath}/product/product-by-category`, controller.getProductByCategory);
//For operations in Users
    app.get(`${basePath}/user/all-user`, controller.getAllUser);
    app.post(`${basePath}/user/add-user`, controller.postAddUser);
    app.post(`${basePath}/user/edit-user`, controller.postEditUser);
    app.post(`${basePath}/user/delete-user`, controller.getDeleteUser);
    app.post(`${basePath}/user/change-password`, controller.changePassword);
    app.post(`${basePath}/user/single-user`, controller.getSingleUser);
    app.post(`${basePath}/sendEmail`, controller.sendEmail);
};