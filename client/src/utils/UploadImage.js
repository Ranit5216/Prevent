import Axios from '../utils/Axios'
import SummaryApi from '../common/SummaryApi'

const uploadFile = async(file)=>{
    try {
        const formData = new FormData()
        formData.append('file',file)

        const response = await Axios({
            ...SummaryApi.uploadImage,
            data : formData
        })

        return response
    } catch (error) {
        return error
    }
}

export default uploadFile