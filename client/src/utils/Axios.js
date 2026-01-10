import axios from "axios";
import SummaryApi , { baseURL } from "../common/SummaryApi";

const Axios = axios.create({
    baseURL : baseURL,
    withCredentials : true
})

//sending access token in the header
Axios.interceptors.request.use(
    async(config)=>{
        const accessToken = localStorage.getItem('accesstoken')

        if(accessToken){
            config.headers.Authorization = `Bearer ${accessToken}`
        }

        // Prevent caching for GET requests to ensure fresh data
        if (config.method === 'get' || config.method === 'GET') {
            config.headers['Cache-Control'] = 'no-cache, no-store, must-revalidate'
            config.headers['Pragma'] = 'no-cache'
            config.headers['Expires'] = '0'
        }

        return config
    },
    (error)=>{
        return Promise.reject(error)
    }
)

//extend the life span of access token with 
// the help refresh
Axios.interceptors.response.use(
    (response)=>{
        return response
    },
    async(error)=>{
        let originRequest = error.config 

        if(error.response?.status === 401 && !originRequest.retry){
            originRequest.retry = true

            const refreshToken = localStorage.getItem("refreshToken")

            if(refreshToken){
                try {
                    const newAccessToken = await refreshAccessToken(refreshToken)

                    if(newAccessToken){
                        originRequest.headers.Authorization = `Bearer ${newAccessToken}`
                        return Axios(originRequest)
                    }
                } catch (refreshError) {
                    // Refresh token failed, clear tokens and redirect to login
                    localStorage.removeItem('accesstoken')
                    localStorage.removeItem('refreshToken')
                }
            } else {
                // No refresh token, clear access token
                localStorage.removeItem('accesstoken')
            }
        }
        
        return Promise.reject(error)
    }
)


const refreshAccessToken = async(refreshToken)=>{
    try {
        const response = await Axios({
            ...SummaryApi.refreshToken,
            headers : {
                Authorization : `Bearer ${refreshToken}`
            }
        })

        // Safely access response data
        if(response?.data?.data?.accessToken) {
            const accessToken = response.data.data.accessToken
            localStorage.setItem('accesstoken',accessToken)
            return accessToken
        }
        return null
    } catch (error) {
        console.error('Refresh token error:', error)
        return null
    }
}

export default Axios