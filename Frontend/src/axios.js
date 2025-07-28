import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:9090/api", // change this if your backend runs on different port
});

export default instance;
