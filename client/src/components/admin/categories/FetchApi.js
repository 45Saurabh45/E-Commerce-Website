import axios from "axios";

const apiURL = process.env.REACT_APP_API_URL;

// ✅ Token helper
const BearerToken = () => {
  const jwt = localStorage.getItem("jwt");
  return jwt ? JSON.parse(jwt).token : null;
};

// ✅ Common headers
const Headers = () => ({
  headers: {
    token: `Bearer ${BearerToken()}`,
  },
});


// =========================
// ✅ GET ALL CATEGORY
// =========================
export const getAllCategory = async () => {
  try {
    const res = await axios.get(
      `${apiURL}/api/category/all-category`,
      Headers()
    );
    return res.data;
  } catch (error) {
    console.error("getAllCategory error:", error);
    return { error: "Failed to fetch categories" };
  }
};


// =========================
// ✅ CREATE CATEGORY (FILE UPLOAD - CLOUDINARY)
// =========================
export const createCategory = async ({
  cName,
  cImage,
  cDescription,
  cStatus,
}) => {
  try {
    const formData = new FormData();

    formData.append("cImage", cImage);
    formData.append("cName", cName);
    formData.append("cDescription", cDescription);
    formData.append("cStatus", cStatus);

    const res = await axios.post(
      `${apiURL}/api/category/add-category`,
      formData,
      {
        headers: {
          ...Headers().headers,
          // ❗ DO NOT manually set Content-Type
        },
      }
    );

    return res.data;
  } catch (error) {
    console.error("createCategory error:", error);
    return {
      error: error?.response?.data?.error || "Failed to create category",
    };
  }
};


// =========================
// ✅ EDIT CATEGORY (NO IMAGE)
// =========================
export const editCategory = async (cId, des, status) => {
  try {
    const res = await axios.post(
      `${apiURL}/api/category/edit-category`,
      {
        cId,
        cDescription: des,
        cStatus: status,
      },
      Headers()
    );

    return res.data;
  } catch (error) {
    console.error("editCategory error:", error);
    return {
      error: error?.response?.data?.error || "Failed to update category",
    };
  }
};


// =========================
// ✅ DELETE CATEGORY
// =========================
export const deleteCategory = async (cId) => {
  try {
    const res = await axios.post(
      `${apiURL}/api/category/delete-category`,
      { cId },
      Headers()
    );

    return res.data;
  } catch (error) {
    console.error("deleteCategory error:", error);
    return {
      error: error?.response?.data?.error || "Failed to delete category",
    };
  }
};