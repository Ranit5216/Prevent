export const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

const SummaryApi = {
    register : {
        url : '/api/user/register',
        method : 'post'
    },
    login : {
        url : '/api/user/login',
        method : 'post'
    },
    forgot_password : {
        url : '/api/user/forgot-password',
        method : 'put'
    },
    forgot_password_otp_verification : {
        url : '/api/user/verify-forgot-password-otp',
        method : 'put'
    },
    resetPassword : {
        url : '/api/user/reset-password',
        method : 'put'
    },
    refreshToken : {
        url : '/api/user/refresh-token',
        method : 'post'
    },
    userDetails : {
        url : '/api/user/user-details',
        method : "get"
    },
    logout : {
        url : "/api/user/logout",
        method : 'get'
    },
    uploadAvatar : {
        url : "/api/user/upload-avatar",
        method : "put"
    },
    updateUserDetails : {
        url : '/api/user/update-user',
        method : 'put'
    },
    addCategory : {
        url : '/api/category/add-category',
        method : 'post'

    },
    uploadImage : {
        url : '/api/file/upload',
        method : 'post'
    },
    getCategory : {
        url : '/api/category/get',
        method : 'get'
    },
    updateCategory : {
        url : '/api/category/update',
        method : 'put'
    },
    deleteCategory : {
        url : '/api/category/delete',
        method : 'delete'
    },
    createSubCategory : {
        url : '/api/subcategory/create',
        method : 'post'
    },
    getSubCategory : {
        url : '/api/subcategory/get',
        method : 'post'
    },
    updateSubCategory : {
        url : '/api/subcategory/update',
        method : 'put'
    },
    deleteSubCategory : {
        url : '/api/subcategory/delete',
        method : 'delete'
    },
    createProduct : {
        url : '/api/product/create',
        method : 'post'
    },
    getProduct : {
        url : '/api/product/get',
        method : 'post'
    },
    getProductByCategory : {
        url : '/api/product/get-product-by-category',
        method : 'post'
    },
    getProductByCategoryAndSubCategory : {
        url : '/api/product/get-pruduct-by-category-and-subcategory',
        method : 'post'
    },
    getProductDetails : {
        url : '/api/product/get-product-details',
        method : 'post'

    },
    updateProductDetails : {
        url : '/api/product/update-product-details',
        method : 'put'
    },
    deleteProduct : {
        url : '/api/product/delete-product',
        method : 'delete'
    },
    searchProduct : {
        url : '/api/product/search-product',
        method : 'post'
    },
    addTocart : {
        url : '/api/cart/create',
        method : 'post'
    },
    getCartItem : {
        url : '/api/cart/get',
        method : 'get'
    },
    updateCartItemQty : {
        url : '/api/cart/update-qty',
        method : 'put'
    },
    deleteCartItem : {
        url : '/api/cart/delete-cart-item',
        method : 'delete'
    },
    createAddress : {
        url : '/api/address/create',
        method : 'post'
    },
    getAddress : {
        url : "/api/address/get",
        method : 'get'
    },
    updateAddress : {
        url : '/api/address/update',
        method : 'put'
    },
    disableAddress : {
        url : '/api/address/disable',
        method : 'delete'
    },
    CashOnDeliveryOrder : {
        url : "/api/order/cash-on-delivery",
        method : "post"
    },

     payment_url : {
        url : "/api/order/checkout",
        method : 'post'
    },
    getOrderItems : {
        url : '/api/order/order-list',
        method : 'get'
    },
    getAllOrders: {
        url: '/api/order/admin/all-orders',
        method: 'get'
    },
    updateOrderStatus: {
        url: '/api/order/admin/update-status',
        method: 'put'
    },
    cancelOrder: {
        url: '/api/order/cancel',
        method: 'POST'
    },
    verify_otp: {
        url: '/api/user/verify-otp',
        method: 'post'
    },
    resend_otp: {
        url: '/api/user/resend-otp',
        method: 'post'
    },
    contactForm: {
        url: '/api/contact/submit',
        method: 'post'
    },
    getChatSession: {
        url: '/api/chat/session',
        method: 'get'
    },
    saveChatMessage: {
        url: '/api/chat/message',
        method: 'post'
    },
    getChatHistory: {
        url: '/api/chat/history',
        method: 'get'
    },
    getAllActiveChats: {
        url: '/api/chat/admin/active-chats',
        method: 'get'
    },
    canUserReview: {
        url: '/api/review/can-review',
        method: 'post'
    },
    createReview: {
        url: '/api/review/create',
        method: 'post'
    },
    getProductReviews: {
        url: '/api/review/get',
        method: 'post'
    },
    updateReview: {
        url: '/api/review/update',
        method: 'put'
    },
    deleteReview: {
        url: '/api/review/delete',
        method: 'delete'
    },
    markReviewHelpful: {
        url: '/api/review/helpful',
        method: 'post'
    },
    reportReview: {
        url: '/api/review/report',
        method: 'post'
    },
    getDashboardAnalytics: {
        url: '/api/admin/dashboard-analytics',
        method: 'get'
    },
    getSalesReports: {
        url: '/api/admin/sales-reports',
        method: 'post'
    },
    getCommissionData: {
        url: '/api/admin/commission-data',
        method: 'get'
    },
    saveNotificationSubscription: {
        url: '/api/notifications/subscribe',
        method: 'post'
    },
    removeNotificationSubscription: {
        url: '/api/notifications/unsubscribe',
        method: 'delete'
    }
}
export default SummaryApi