const { toTitleCase, validateEmail } = require("../config/function");
const bcrypt = require("bcryptjs");
const allmodels = require("../models/index");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/keys");
const fs = require("fs")
const path = require("path");
const nodemailer = require("nodemailer")



exports.isAdmin = async (req, res, next) => {
    try {
      const { loggedInUserId } = req.body;
      const loggedInUserRole = await allmodels.userModel.findById(loggedInUserId);
      res.json({ role: loggedInUserRole.userRole,
        email: loggedInUserRole.email
       });
    } catch (err) {
      next(err);
    }
  };
  
  exports.allUser = async (req, res, next) => {
    try {
      const allUser = await allmodels.userModel.find({});
      res.json({ users: allUser });
    } catch (err) {
      next(err);
    }
  };
  
  exports.postSignup = async (req, res, next) => {
    const { name, email, password, cPassword, userRole } = req.body;
    let error = {};
  
    if (!name || !email || !password || !cPassword) {
      error = {
        ...error,
        name: "Field must not be empty",
        email: "Field must not be empty",
        password: "Field must not be empty",
        cPassword: "Field must not be empty",
      };
      return res.json({ error });
    }
  
    if (name.length < 3 || name.length > 25) {
      error = { ...error, name: "Name must be 3-25 characters" };
      return res.json({ error });
    }
  
    if (!validateEmail(email)) {
      error = {
        ...error,
        email: "Email is not valid",
      };
      return res.json({ error });
    }
  
    if (password.length < 8 || password.length > 255) {
      error = {
        ...error,
        password: "Password must be between 8 and 255 characters",
      };
      return res.json({ error });
    }
  
    if (password !== cPassword) {
      error = {
        ...error,
        cPassword: "Passwords do not match",
      };
      return res.json({ error });
    }
  
    try {
      const existingUser = await allmodels.userModel.findOne({ email });
      if (existingUser) {
        error = {
          ...error,
          email: "Email already exists",
        };
        return res.json({ error });
      }
  
      const hashedPassword = bcrypt.hashSync(password, 10);
      const newUser = new allmodels.userModel({
        name: toTitleCase(name),
        email,
        password: hashedPassword,
        userRole, // Role 1 for admin and 0 for user/customer
      });
  
      await newUser.save();
      res.json({
        success: "Account created successfully. Please login",
      });
    } catch (err) {
      next(err);
    }
  };
  
  exports.postSignin = async (req, res, next) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.json({
        error: "Fields must not be empty",
      });
    }
  
    try {
      const user = await allmodels.userModel.findOne({ email });
      console.log(user)
      if (!user) {
        return res.json({
          error: "Invalid email or password",
        });
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.json({
          error: "Invalid email or password",
        });
      }
  
      const token = jwt.sign(
        { _id: user._id, role: user.userRole, email: user.email },
        JWT_SECRET
      );
  
      const decodedToken = jwt.verify(token, JWT_SECRET);
      res.json({
        token,
        user: decodedToken,
      });
    } catch (err) {
      next(err);
    }
  };

  const deleteFile = (filePath) => {
    return new Promise((resolve, reject) => {
      fs.unlink(filePath, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  };
  
  // Get All Categories
  exports.getAllCategory = async (req, res, next) => {
    try {
      const categories = await allmodels.categoryModel.find({}).sort({ _id: -1 });
      res.json({ categories });
    } catch (err) {
      next(err);
    }
  };
  
  // Add New Category
  exports.postAddCategory = async (req, res, next) => {
    const { cName, cDescription, cStatus } = req.body;
    const cImage = req.file.filename;
    const filePath = path.join(__dirname, '../public/uploads/categories/', cImage);
  
    if (!cName || !cDescription || !cStatus || !cImage) {
      await deleteFile(filePath).catch(error => console.error(error));
      return res.status(400).json({ error: "All fields must be required" });
    }
  
    const formattedName = toTitleCase(cName);
  
    try {
      const existingCategory = await allmodels.categoryModel.findOne({ cName: formattedName });
      if (existingCategory) {
        await deleteFile(filePath).catch(error => console.error(error));
        return res.status(400).json({ error: "Category already exists" });
      }
  
      const newCategory = new allmodels.categoryModel({
        cName: formattedName,
        cDescription,
        cStatus,
        cImage,
      });
  
      await newCategory.save();
      res.json({ success: "Category created successfully" });
    } catch (err) {
      await deleteFile(filePath).catch(error => console.error(error));
      next(err);
    }
  };
  
  // Edit Category
  exports.postEditCategory = async (req, res, next) => {
    const { cId, cDescription, cStatus } = req.body;
  
    if (!cId || !cDescription || !cStatus) {
      return res.status(400).json({ error: "All fields must be required" });
    }
  
    try {
      const updatedCategory = await allmodels.categoryModel.findByIdAndUpdate(
        cId,
        { cDescription, cStatus, updatedAt: Date.now() },
        { new: true }
      );
  
      if (updatedCategory) {
        res.json({ success: "Category updated successfully" });
      } else {
        res.status(404).json({ error: "Category not found" });
      }
    } catch (err) {
      next(err);
    }
  };
  
  // Delete Category
  exports.getDeleteCategory = async (req, res, next) => {
    const { cId } = req.body;
  
    if (!cId) {
      return res.status(400).json({ error: "Category ID must be required" });
    }
  
    try {
      const category = await allmodels.categoryModel.findById(cId);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }
  
      const filePath = path.join(__dirname, '../public/uploads/categories/', category.cImage);
  
      await allmodels.categoryModel.findByIdAndDelete(cId);
      await deleteFile(filePath);
  
      res.json({ success: "Category deleted successfully" });
    } catch (err) {
      next(err);
    }
  };

  exports.getImages = async (req, res, next) => {
    try {
      const images = await allmodels.customizeModel.find({});
      res.json({ images });
    } catch (err) {
      next(err);
    }
  };
  
  // Upload Slide Image
  exports.uploadSlideImage = async (req, res, next) => {
    const image = req.file?.filename;
    if (!image) {
      return res.status(400).json({ error: "All fields are required" });
    }
  
    try {
      const newCustomize = new allmodels.customizeModel({
        slideImage: image,
      });
  
      await newCustomize.save();
      res.json({ success: "Image uploaded successfully" });
    } catch (err) {
      next(err);
    }
  };
  
  // Delete Slide Image
  exports.deleteSlideImage = async (req, res, next) => {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: "ID is required" });
    }
  
    try {
      const deletedSlideImage = await allmodels.customizeModel.findById(id);
      if (!deletedSlideImage) {
        return res.status(404).json({ error: "Image not found" });
      }
  
      const filePath = path.join(__dirname, '../public/uploads/customize/', deletedSlideImage.slideImage);
  
      await allmodels.customizeModel.findByIdAndDelete(id);
      await deleteFile(filePath);
  
      res.json({ success: "Image deleted successfully" });
    } catch (err) {
      next(err);
    }
  };
  
  // Get All Data
  exports.getAllData = async (req, res, next) => {
    try {
      const categoriesCount = await allmodels.categoryModel.countDocuments({});
      const productsCount = await allmodels.productModel.countDocuments({});
      const ordersCount = await allmodels.orderModel.countDocuments({});
      const usersCount = await allmodels.userModel.countDocuments({});
  
      res.json({ Categories: categoriesCount, Products: productsCount, Orders: ordersCount, Users: usersCount });
    } catch (err) {
      next(err);
    }
  };
  

  // Get All Orders
  exports.getAllOrders = async (req, res, next) => {
    try {
      const orders = await allmodels.orderModel
        .find({})
        .populate("allProduct.id", "pName pImages pPrice")
        .populate("user", "name email")
        .sort({ _id: -1 });
      
      res.json({ orders });
    } catch (err) {
      next(err);
    }
  };
  
  // Get Orders by User
  exports.getOrderByUser = async (req, res, next) => {
    const { uId } = req.body;
  
    if (!uId) {
      return res.status(400).json({ message: "User ID is required" });
    }
  
    try {
      const orders = await allmodels.orderModel
        .find({ user: uId })
        .populate("allProduct.id", "pName pImages pPrice")
        .populate("user", "name email")
        .sort({ _id: -1 });
      
      res.json({ orders });
    } catch (err) {
      next(err);
    }
  };
  
  // Create New Order
  exports.postCreateOrder = async (req, res, next) => {
    const { allProduct, user, amount, address, phone } = req.body;
  
    if (!allProduct || !user || !amount || !address || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }
  
    try {
      const newOrder = new allmodels.orderModel({
        allProduct,
        user,
        amount,
        address,
        phone,
      });
  
      await newOrder.save();
      res.json({ success: "Order created successfully" });
    } catch (err) {
      next(err);
    }
  };
  
  // Update Order
  exports.postUpdateOrder = async (req, res, next) => {
    const { oId, status } = req.body;
  
    if (!oId || !status) {
      return res.status(400).json({ message: "Order ID and status are required" });
    }
  
    try {
      const updatedOrder = await allmodels.orderModel.findByIdAndUpdate(
        oId,
        { status, updatedAt: Date.now() },
        { new: true }
      );
  
      if (updatedOrder) {
        res.json({ success: "Order updated successfully" });
      } else {
        res.status(404).json({ error: "Order not found" });
      }
    } catch (err) {
      next(err);
    }
  };
  
  // Delete Order
  exports.postDeleteOrder = async (req, res, next) => {
    const { oId } = req.body;
  
    if (!oId) {
      return res.status(400).json({ error: "Order ID is required" });
    }
  
    try {
      const deletedOrder = await allmodels.orderModel.findByIdAndDelete(oId);
  
      if (deletedOrder) {
        res.json({ success: "Order deleted successfully" });
      } else {
        res.status(404).json({ error: "Order not found" });
      }
    } catch (err) {
      next(err);
    }
  };
  
  const deleteImages = (images, mode) => {
    const basePath = path.resolve(__dirname + "../../") + "/public/uploads/products/";
  
    images.forEach(image => {
      let filePath = mode === "file" ? basePath + image.filename : basePath + image;
      if (fs.existsSync(filePath)) {
        fs.unlink(filePath, err => {
          if (err) console.error(err);
        });
      }
    });
  };
  
  // Get All Products
  exports.getAllProduct = async (req, res, next) => {
    try {
      const products = await allmodels.productModel
        .find({})
        .populate("pCategory", "_id cName")
        .sort({ _id: -1 });
      
      res.json({ Products: products });
    } catch (err) {
      next(err);
    }
  };
  
  // Add Product
  exports.postAddProduct = async (req, res, next) => {
    const { pName, pDescription, pPrice, pQuantity, pCategory, pOffer, pStatus } = req.body;
    const images = req.files;
  
    // Validation
    if (!pName || !pDescription || !pPrice || !pQuantity || !pCategory || !pOffer || !pStatus) {
      deleteImages(images, "file");
      return res.status(400).json({ error: "All fields must be required" });
    }
  
    if (pName.length > 255 || pDescription.length > 3000) {
      deleteImages(images, "file");
      return res.status(400).json({ error: "Name must be less than 255 characters and description less than 3000 characters" });
    }
  
    if (images.length !== 2) {
      deleteImages(images, "file");
      return res.status(400).json({ error: "Must provide exactly 2 images" });
    }
  
    try {
      const allImages = images.map(img => img.filename);
      const newProduct = new allmodels.productModel({
        pImages: allImages,
        pName,
        pDescription,
        pPrice,
        pQuantity,
        pCategory,
        pOffer,
        pStatus,
      });
  
      await newProduct.save();
      res.json({ success: "Product created successfully" });
    } catch (err) {
      next(err);
    }
  };
  
  // Edit Product
  exports.postEditProduct = async (req, res, next) => {
    const {
      pId,
      pName,
      pDescription,
      pPrice,
      pQuantity,
      pCategory,
      pOffer,
      pStatus,
      pImages
    } = req.body;
    const editImages = req.files;
  
    // Validation
    if (!pId || !pName || !pDescription || !pPrice || !pQuantity || !pCategory || !pOffer || !pStatus) {
      return res.status(400).json({ error: "All fields must be required" });
    }
  
    if (pName.length > 255 || pDescription.length > 3000) {
      return res.status(400).json({ error: "Name must be less than 255 characters and description less than 3000 characters" });
    }
  
    if (editImages.length === 1) {
      deleteImages(editImages, "file");
      return res.status(400).json({ error: "Must provide exactly 2 images" });
    }
  
    try {
      const editData = {
        pName,
        pDescription,
        pPrice,
        pQuantity,
        pCategory,
        pOffer,
        pStatus,
      };
  
      if (editImages.length === 2) {
        const allEditImages = editImages.map(img => img.filename);
        editData.pImages = allEditImages;
        deleteImages(pImages.split(","), "string");
      }
  
      await allmodels.productModel.findByIdAndUpdate(pId, editData, { new: true });
      res.json({ success: "Product edited successfully" });
    } catch (err) {
      next(err);
    }
  };
  
  // Delete Product
  exports.getDeleteProduct = async (req, res, next) => {
    const { pId } = req.body;
  
    if (!pId) {
      return res.status(400).json({ error: "Product ID is required" });
    }
  
    try {
      const deleteProductObj = await allmodels.productModel.findById(pId);
      if (deleteProductObj) {
        await allmodels.productModel.findByIdAndDelete(pId);
        deleteImages(deleteProductObj.pImages, "string");
        res.json({ success: "Product deleted successfully" });
      } else {
        res.status(404).json({ error: "Product not found" });
      }
    } catch (err) {
      next(err);
    }
  };
  
  // Get Single Product
  exports.getSingleProduct = async (req, res, next) => {
    const { pId } = req.body;
  
    if (!pId) {
      return res.status(400).json({ error: "Product ID is required" });
    }
  
    try {
      const singleProduct = await allmodels.productModel
        .findById(pId)
        .populate("pCategory", "cName")
        .populate("pRatingsReviews.user", "name email userImage");
  
      if (singleProduct) {
        res.json({ Product: singleProduct });
      } else {
        res.status(404).json({ error: "Product not found" });
      }
    } catch (err) {
      next(err);
    }
  };
  
  // Get Products by Category
  exports.getProductByCategory = async (req, res, next) => {
    const { catId } = req.body;
  
    if (!catId) {
      return res.status(400).json({ error: "Category ID is required" });
    }
  
    try {
      const products = await allmodels.productModel
        .find({ pCategory: catId })
        .populate("pCategory", "cName");
  
      res.json({ Products: products });
    } catch (err) {
      next(err);
    }
  };
  
  // Get Products by Price
  exports.getProductByPrice = async (req, res, next) => {
    const { price } = req.body;
  
    if (!price) {
      return res.status(400).json({ error: "Price is required" });
    }
  
    try {
      const products = await allmodels.productModel
        .find({ pPrice: { $lt: price } })
        .populate("pCategory", "cName")
        .sort({ pPrice: -1 });
  
      res.json({ Products: products });
    } catch (err) {
      next(err);
    }
  };
  
  // Get Wish List Products
  exports.getWishProduct = async (req, res, next) => {
    const { productArray } = req.body;
  
    if (!productArray) {
      return res.status(400).json({ error: "Product array is required" });
    }
  
    try {
      const wishProducts = await allmodels.productModel.find({ _id: { $in: productArray } });
      res.json({ Products: wishProducts });
    } catch (err) {
      next(err);
    }
  };
  
  // Get Cart Products
  exports.getCartProduct = async (req, res, next) => {
    const { productArray } = req.body;
  
    if (!productArray) {
      return res.status(400).json({ error: "Product array is required" });
    }
  
    try {
      const cartProducts = await allmodels.productModel.find({ _id: { $in: productArray } });
      res.json({ Products: cartProducts });
    } catch (err) {
      next(err);
    }
  };
  
  // Add Review
  exports.postAddReview = async (req, res, next) => {
    const { pId, uId, rating, review } = req.body;
  
    if (!pId || !rating || !review || !uId) {
      return res.status(400).json({ error: "All fields are required" });
    }
  
    try {
      const product = await allmodels.productModel.findById(pId);
  
      if (product.pRatingsReviews.some(item => item.user.toString() === uId)) {
        return res.status(400).json({ error: "You have already reviewed this product" });
      }
  
      await allmodels.productModel.findByIdAndUpdate(pId, {
        $push: {
          pRatingsReviews: { review, user: uId, rating }
        }
      });
  
      res.json({ success: "Thanks for your review" });
    } catch (err) {
      next(err);
    }
  };
  
  // Delete Review
  exports.deleteReview = async (req, res, next) => {
    const { rId, pId } = req.body;
  
    if (!rId) {
      return res.status(400).json({ error: "Review ID is required" });
    }
  
    try {
      await allmodels.productModel.findByIdAndUpdate(pId, {
        $pull: { pRatingsReviews: { _id: rId } }
      });
  
      res.json({ success: "Your review has been deleted" });
    } catch (err) {
      next(err);
    }
  };
  
  exports.getAllUser = async (req, res, next) => {
    try {
      const users = await allmodels.userModel
        .find({})
        .populate("allProduct.id", "pName pImages pPrice")
        .populate("user", "name email")
        .sort({ _id: -1 });
      
      res.json({ Users: users });
    } catch (err) {
      next(err);
    }
  };
  
  // Get Single User
  exports.getSingleUser = async (req, res, next) => {
    const { uId } = req.body;
    if (!uId) {
      return res.status(400).json({ error: "User ID is required" });
    }
  
    try {
      const user = await allmodels.userModel
        .findById(uId)
        .select("name email phoneNumber userImage updatedAt createdAt");
  
      if (user) {
        res.json({ User: user });
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (err) {
      next(err);
    }
  };
  
  // Add User
  exports.postAddUser = async (req, res, next) => {
    const { allProduct, user, amount, transactionId, address, phone } = req.body;
  
    if (!allProduct || !user || !amount || !transactionId || !address || !phone) {
      return res.status(400).json({ message: "All fields must be required" });
    }
  
    try {
      const newUser = new allmodels.userModel({
        allProduct,
        user,
        amount,
        transactionId,
        address,
        phone,
      });
  
      await newUser.save();
      res.json({ success: "User created successfully" });
    } catch (err) {
      next(err);
    }
  };
  
  // Edit User
  exports.postEditUser = async (req, res, next) => {
    const { uId, name, phoneNumber } = req.body;
  
    if (!uId || !name || !phoneNumber) {
      return res.status(400).json({ message: "All fields must be required" });
    }
  
    try {
      await allmodels.userModel.findByIdAndUpdate(uId, {
        name,
        phoneNumber,
        updatedAt: Date.now(),
      });
  
      res.json({ success: "User updated successfully" });
    } catch (err) {
      next(err);
    }
  };
  
  // Delete User
  exports.getDeleteUser = async (req, res, next) => {
    const { oId, status } = req.body;
  
    if (!oId || !status) {
      return res.status(400).json({ message: "All fields must be required" });
    }
  
    try {
      await allmodels.userModel.findByIdAndUpdate(oId, {
        status,
        updatedAt: Date.now(),
      });
  
      res.json({ success: "User status updated successfully" });
    } catch (err) {
      next(err);
    }
  };
  
  // Change Password
  exports.changePassword = async (req, res, next) => {
    const { uId, oldPassword, newPassword } = req.body;
  
    if (!uId || !oldPassword || !newPassword) {
      return res.status(400).json({ message: "All fields must be required" });
    }
  
    try {
      const user = await allmodels.userModel.findById(uId);
      if (!user) {
        return res.status(404).json({ error: "Invalid user" });
      }
  
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Old password is incorrect" });
      }
  
      const hashedPassword = bcrypt.hashSync(newPassword, 10);
      await allmodels.userModel.findByIdAndUpdate(uId, { password: hashedPassword });
  
      res.json({ success: "Password updated successfully" });
    } catch (err) {
      next(err);
    }
  };  

exports.sendEmail = async (req, res, next) => {
    const { token } = req.headers;
    console.log(token)
    if (!token) {
      return res.status(401).json({ success: false, error: 'No token provided' });
    }
    
    try {
      const token1 = token.split(' ')[1];
      const decoded = jwt.verify(token1, process.env.JWT_SECRET);
      var userEmail = decoded.email;

      const transporter = nodemailer.createTransport({
        service: 'gmail',
  auth: {
    user: process.env.USER_MAIL,
    pass: process.env.USER_PASS 
  }
     })

      const mailOptions = {
        from: '10c.saurabhtiwari123@gmail.com', 
        to: userEmail,
        subject: 'Your Order is Placed Successfully!',
        text: `Thank you for your order. Your Order is Placed Successfully for login Id ${userEmail}`
      };
  
      await transporter.sendMail(mailOptions);
  
      res.status(200).json({ success: true, message: 'Email sent successfully' });
    } catch (err) {
      console.error('Error sending email:', err);
      next(err);
    }
  };

  
