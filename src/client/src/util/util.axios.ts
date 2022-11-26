import axios from "axios"

export const applyAxiosDefaultHeaders = () => {
    axios.defaults.baseURL = process.env.NODE_ENV === "development" ? `${process.env.REACT_APP_BASE_URL}` : ""
    axios.defaults.withCredentials = true
}

export default applyAxiosDefaultHeaders