import axios from "axios";
const apiURL = process.env.REACT_APP_API_URL;

export const getBrainTreeToken = async () => {
  let uId = JSON.parse(localStorage.getItem("jwt")).user._id;
  try {
    let res = await axios.post(`${apiURL}/api/braintree/get-token`, {
      uId: uId,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getPaymentProcess = async (paymentData) => {
  try {
    let res = await axios.post(`${apiURL}/api/braintree/payment`, paymentData);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const createOrder = async (orderData) => {
  try {
    let res = await axios.post(`${apiURL}/api/order/create-order`, orderData);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const sendEmail = async () => {
  try {
    const response = await axios.post(`${apiURL}/api/sendEmail`, {}, { 
      headers: {
        'token': `Bearer ${JSON.parse(localStorage.getItem('jwt')).token}`,
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};



