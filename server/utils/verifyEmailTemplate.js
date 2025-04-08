const verifyEmailTemplate = ({name,url})=>{
    return`
<p>Dear ${name}</p>
<p>Thank you registering Prevent.</p>
<a href=${url} "color:white;background : #071263;margin-top : 10px,padding:20px">
    Verify Email
</a>
`
}

export default verifyEmailTemplate