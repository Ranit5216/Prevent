import toast from "react-hot-toast"

const AxiosToastError = (error)=>{
    console.error("Axios Error:", error)
    
    if (error?.response?.data?.message) {
        toast.error(error.response.data.message)
    } else if (error?.message) {
        toast.error(error.message)
    } else if (error?.response?.status === 500) {
        toast.error("Internal server error. Please try again later.")
    } else if (error?.response?.status === 404) {
        toast.error("Service not found. Please check your connection.")
    } else if (error?.response?.status === 401) {
        toast.error("User not Login. Please Login First")
    } else if (error?.response?.status === 403) {
        toast.error("Access forbidden.")
    } else if (error?.code === 'NETWORK_ERROR' || error?.code === 'ERR_NETWORK') {
        toast.error("Network error. Please check your internet connection.")
    } else {
        toast.error("Something went wrong. Please try again.")
    }
}

export default AxiosToastError