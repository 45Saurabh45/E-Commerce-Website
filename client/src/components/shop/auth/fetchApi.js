import axios from "axios";
const apiURL = process.env.REACT_APP_API_URL;

export const isAuthenticate = () =>
  localStorage.getItem("jwt") ? JSON.parse(localStorage.getItem("jwt")) : false;

export const isAdmin = () => {
  try {
    const jwtStr = localStorage.getItem("jwt");
    if (!jwtStr) return false;

    const jwt = JSON.parse(jwtStr);
    return jwt?.user?.role === 1;   // or "admin" depending on your backend
  } catch (e) {
    // corrupted storage value
    return false;
  }
};

    export const loginReq = async ({ email, password }) => {
      const data = { email, password };
      try {
        let res = await axios.post(`${apiURL}/api/signin`, data);
        const { token, user } = res.data;
    
        localStorage.setItem('jwt', JSON.stringify({ token, user }));
        return res.data;
      } catch (error) {
        console.log(error);
        throw error; 
      }
    };

export const signupReq = async ({ name, email, password, cPassword, userRole }) => {
  const data = { name, email, password, cPassword, userRole };
  try {
    let res = await axios.post(`${apiURL}/api/signup`, data);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};
