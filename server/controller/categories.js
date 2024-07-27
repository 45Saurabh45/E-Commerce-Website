const { toTitleCase } = require("../config/function");
const categoryModel = require("../models/categories");
const fs = require("fs");

class Category {
  async getAllCategory(req, res) {
    try {
      let Categories = await categoryModel.find({}).sort({ _id: -1 });
      if (Categories) {
        return res.json({ Categories });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async postAddCategory(req, res) {
    let { cName, cDescription, cStatus } = req.body;
    let cImage = req.file.filename;
    console.log(cName,cDescription,cStatus,cImage)
    const filePath = `../server/public/uploads/categories/${cImage}`;
  
    // if (!cName || !cDescription || !cStatus || cImage) {
    //   // fs.unlink(filePath, (err) => {
    //   //   if (err) {
    //   //     console.log(err);
    //   //   }
    //   //   return res.json({ error: "All fields must be required" });
    //   // });
    //   return res.json({ error: "All fields must be required" });
    // }
  
    cName = toTitleCase(cName);
  
    try {
      const checkCategoryExists = await categoryModel.findOne({ cName });
      console.log(checkCategoryExists)
      // if (checkCategoryExists) {
      //   // fs.unlink(filePath, (err) => {
      //   //   if (err) {
      //   //     console.log(err);
      //   //   }
      //   //   return res.json({ error: "Category already exists" });
      //   // });
      //   return res.json({ error: "Category already exists" });
      // }
  
      const newCategory = new categoryModel({
        cName,
        cDescription,
        cStatus,
        cImage,
      });
  
      await newCategory.save();  // No callback, just await the promise
  
      return res.json({ success: "Category created successfully" });
    } catch (err) {
      console.error(err);
      fs.unlink(filePath, (error) => {
        if (error) {
          console.log(error);
        }
      });
      return res.status(500).json({ error: "Internal server error" });
    }
  }
  

  async postEditCategory(req, res) {
    let { cId, cDescription, cStatus } = req.body;
    if (!cId || !cDescription || !cStatus) {
      return res.json({ error: "All filled must be required" });
    }
    try {
      let editCategory = categoryModel.findByIdAndUpdate(cId, {
        cDescription,
        cStatus,
        updatedAt: Date.now(),
      });
      let edit = await editCategory.exec();
      if (edit) {
        return res.json({ success: "Category edit successfully" });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async getDeleteCategory(req, res) {
    let { cId } = req.body;
    if (!cId) {
      return res.json({ error: "All filled must be required" });
    } else {
      try {
        let deletedCategoryFile = await categoryModel.findById(cId);
        const filePath = `../server/public/uploads/categories/${deletedCategoryFile.cImage}`;

        let deleteCategory = await categoryModel.findByIdAndDelete(cId);
        if (deleteCategory) {
          // Delete Image from uploads -> categories folder 
          fs.unlink(filePath, (err) => {
            if (err) {
              console.log(err);
            }
            return res.json({ success: "Category deleted successfully" });
          });
        }
      } catch (err) {
        console.log(err);
      }
    }
  }
}

const categoryController = new Category();
module.exports = categoryController;
