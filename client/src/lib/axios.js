import axios_lib from "axios";

const axios = axios_lib.create({
  baseURL: `${import.meta.env.VITE_BACK_END}/api`,
  withCredentials: true,
});

export default axios;
export { default as axios } from "./axios";
