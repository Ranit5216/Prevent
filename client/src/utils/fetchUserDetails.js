import Axios from "./Axios"
import SummaryApi from "../common/SummaryApi"

const fetchUserDetails = async()=>{
    try {
        const response = await Axios({
            ...SummaryApi.userDetails
        })
        
        // Safely check response structure
        if(response?.data?.success && response?.data?.data) {
            return response.data
        }
        
        return null
    } catch (error) {
        // Error fetching user details - user not logged in or token expired
        return null
    }
}

export default fetchUserDetails