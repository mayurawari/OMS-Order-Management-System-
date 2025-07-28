import axios from "axios";

const instance = axios.create({
  baseURL: "https://oms-order-management-system-1.onrender.com/api", // change this if your backend runs on different port
});

export default instance;
