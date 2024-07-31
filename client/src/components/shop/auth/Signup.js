import React, { Fragment, useState } from "react";
import { signupReq } from "./fetchApi";

const Signup = (props) => {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    cPassword: "",
    userRole: "", // No default value, making it mandatory
    error: false,
    loading: false,
    success: false,
  });

  const alert = (msg, type) => (
    <div className={`text-sm text-${type}-500`}>{msg}</div>
  );

  const formSubmit = async () => {
    setData({ ...data, loading: true });
    
    // Validate password match
    if (data.cPassword !== data.password) {
      return setData({
        ...data,
        error: {
          cPassword: "Password doesn't match",
          password: "Password doesn't match",
        },
      });
    }

    // Validate userRole selection
    if (!data.userRole) {
      return setData({
        ...data,
        error: {
          userRole: "Please select a user role",
        },
      });
    }

    try {
      let responseData = await signupReq({
        name: data.name,
        email: data.email,
        password: data.password,
        cPassword: data.cPassword,
        userRole: data.userRole,
      });
      if (responseData.error) {
        setData({
          ...data,
          loading: false,
          error: responseData.error,
          password: "",
          cPassword: "",
        });
      } else if (responseData.success) {
        setData({
          success: responseData.success,
          name: "",
          email: "",
          password: "",
          cPassword: "",
          userRole: "", // Reset userRole
          loading: false,
          error: false,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Fragment>
      <div className="text-center text-2xl mb-6">Register</div>
      <form className="space-y-4">
        {data.success ? alert(data.success, "green") : ""}
        {data.error && data.error.userRole && alert(data.error.userRole, "red")}
        <div className="flex flex-col">
          <label htmlFor="name">
            Name<span className="text-sm text-gray-600 ml-1">*</span>
          </label>
          <input
            onChange={(e) =>
              setData({
                ...data,
                success: false,
                error: {},
                name: e.target.value,
              })
            }
            value={data.name}
            type="text"
            id="name"
            className={`${
              data.error.name ? "border-red-500" : ""
            } px-4 py-2 focus:outline-none border rounded`}
          />
          {!data.error ? "" : alert(data.error.name, "red")}
        </div>
        <div className="flex flex-col">
          <label htmlFor="email">
            Email address<span className="text-sm text-gray-600 ml-1">*</span>
          </label>
          <input
            onChange={(e) =>
              setData({
                ...data,
                success: false,
                error: {},
                email: e.target.value,
              })
            }
            value={data.email}
            type="email"
            id="email"
            className={`${
              data.error.email ? "border-red-500" : ""
            } px-4 py-2 focus:outline-none border rounded`}
          />
          {!data.error ? "" : alert(data.error.email, "red")}
        </div>
        <div className="flex flex-col">
          <label htmlFor="password">
            Password<span className="text-sm text-gray-600 ml-1">*</span>
          </label>
          <input
            onChange={(e) =>
              setData({
                ...data,
                success: false,
                error: {},
                password: e.target.value,
              })
            }
            value={data.password}
            type="password"
            id="password"
            className={`${
              data.error.password ? "border-red-500" : ""
            } px-4 py-2 focus:outline-none border rounded`}
          />
          {!data.error ? "" : alert(data.error.password, "red")}
        </div>
        <div className="flex flex-col">
          <label htmlFor="cPassword">
            Confirm password
            <span className="text-sm text-gray-600 ml-1">*</span>
          </label>
          <input
            onChange={(e) =>
              setData({
                ...data,
                success: false,
                error: {},
                cPassword: e.target.value,
              })
            }
            value={data.cPassword}
            type="password"
            id="cPassword"
            className={`${
              data.error.cPassword ? "border-red-500" : ""
            } px-4 py-2 focus:outline-none border rounded`}
          />
          {!data.error ? "" : alert(data.error.cPassword, "red")}
        </div>
        <div className="flex flex-col">
          <label>User Role<span className="text-sm text-gray-600 ml-1">*</span></label>
          <div className="flex space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="0"
                checked={data.userRole === "0"}
                onChange={() =>
                  setData({
                    ...data,
                    userRole: "0", // User role
                  })
                }
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="text-gray-700">User</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                value="1"
                checked={data.userRole === "1"}
                onChange={() =>
                  setData({
                    ...data,
                    userRole: "1", // Admin role
                  })
                }
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="text-gray-700">Admin</span>
            </label>
          </div>
          {!data.error ? "" : alert(data.error.userRole, "red")}
        </div>
        <div className="flex flex-col space-y-2 md:flex-row md:justify-between md:items-center">
          <div>
            <input
              type="checkbox"
              id="rememberMe"
              className="px-4 py-2 focus:outline-none border mr-1"
            />
            <label htmlFor="rememberMe">
              Remember me<span className="text-sm text-gray-600">*</span>
            </label>
          </div>
          <a className="block text-gray-600" href="/">
            Lost your password?
          </a>
        </div>
        <div
          onClick={(e) => formSubmit()}
          style={{ background: "#303031" }}
          className="px-4 py-2 text-white text-center cursor-pointer font-medium rounded"
        >
          Create an account
        </div>
      </form>
    </Fragment>
  );
};

export default Signup;
