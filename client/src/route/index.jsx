import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";
import App from "../App"
import Loading from "../components/Loading";

// Lazy load all pages for code splitting
const Home = lazy(() => import("../pages/Home"));
const SearchPage = lazy(() => import("../pages/SearchPage"));
const Login = lazy(() => import("../pages/Login"));
const Register = lazy(() => import("../pages/Register"));
const ForgotPassword = lazy(() => import("../pages/ForgotPassword"));
const OtpVerification = lazy(() => import("../pages/OtpVerification"));
const ResetPassword = lazy(() => import("../pages/ResetPassword"));
const UserMenuMobile = lazy(() => import("../pages/UserMenuMobile"));
const Dashboard = lazy(() => import("../layouts/Dashboard"));
const Profile = lazy(() => import("../pages/Profile"));
const MyOrders = lazy(() => import("../pages/MyOrders"));
const BookingOrders = lazy(() => import("../pages/BookingOrders"));
const Address = lazy(() => import("../pages/Address"));
const CategoryPage = lazy(() => import("../pages/CategoryPage"));
const SubCategoryPage = lazy(() => import("../pages/SubCategoryPage"));
const UploadProduct = lazy(() => import("../pages/UploadProduct"));
const ProductAdmin = lazy(() => import("../pages/ProductAdmin"));
const AdminPermision = lazy(() => import("../layouts/AdminPermission"));
const ProductListPage = lazy(() => import("../pages/ProductListPage"));
const ProductDisplayPage = lazy(() => import("../pages/ProductDisplayPage"));
const CartMobile = lazy(() => import("../pages/CartMobile"));
const CheckoutPage = lazy(() => import("../pages/CheckoutPage"));
const Success = lazy(() => import("../pages/Success"));
const Cancel = lazy(() => import("../pages/Cancel"));
const CustomerSupport = lazy(() => import("../pages/CustomerSupport"));
const AdminChat = lazy(() => import("../pages/AdminChat"));
const VendorDashboard = lazy(() => import("../pages/VendorDashboard"));
const About = lazy(() => import("../pages/About"));
const NotFound = lazy(() => import("../pages/NotFound"));

// Wrapper component for Suspense
const LazyWrapper = ({ children }) => (
  <Suspense fallback={<Loading />}>
    {children}
  </Suspense>
);



const router = createBrowserRouter([
    {
        path : "/",
        element : <App/>,
        children : [
            {
                path : "",
                element : <LazyWrapper><Home/></LazyWrapper>
            },
            {
                path : "search",
                element : <LazyWrapper><SearchPage/></LazyWrapper>
            },
            {
                path : "login",
                element : <LazyWrapper><Login/></LazyWrapper>
            },
            {
                path : "register",
                element : <LazyWrapper><Register/></LazyWrapper>
            },
            {
                path : "forgot-password",
                element : <LazyWrapper><ForgotPassword/></LazyWrapper>
            }, 
            {
                path : "otp-verification",
                element : <LazyWrapper><OtpVerification/></LazyWrapper>
            },
            {
                path : "reset-password",
                element : <LazyWrapper><ResetPassword/></LazyWrapper>
            },
            {
                path : "user",
                element : <LazyWrapper><UserMenuMobile/></LazyWrapper>
            },
            {
                path : "dashboard",
                element : <LazyWrapper><Dashboard/></LazyWrapper>,
                children : [
                    {
                        path : "profile",
                        element : <LazyWrapper><Profile/></LazyWrapper>
                    },
                    {
                        path : "myorders",
                        element : <LazyWrapper><MyOrders/></LazyWrapper>
                    },
                    {
                        path : "bookingorders",
                        element : <LazyWrapper><AdminPermision><BookingOrders/></AdminPermision></LazyWrapper>
                    },
                    {
                        path : "address",
                        element : <LazyWrapper><Address/></LazyWrapper>
                    },
                    {
                        path : "category",
                        element : <LazyWrapper><AdminPermision> <CategoryPage/> </AdminPermision></LazyWrapper>
                    },
                    {
                        path : "subcategory",
                        element : <LazyWrapper><AdminPermision><SubCategoryPage/></AdminPermision></LazyWrapper>
                    },
                    {
                        path : "upload-product",
                        element : <LazyWrapper><AdminPermision><UploadProduct/></AdminPermision></LazyWrapper>
                    },
                    {
                        path : "product",
                        element : <LazyWrapper><AdminPermision><ProductAdmin/></AdminPermision></LazyWrapper>
                    },
                    {
                        path : "admin-chat",
                        element : <LazyWrapper><AdminPermision><AdminChat/></AdminPermision></LazyWrapper>
                    },
                    {
                        path : "vendor-dashboard",
                        element : <LazyWrapper><AdminPermision><VendorDashboard/></AdminPermision></LazyWrapper>
                    },
                ]
            },
            {
                path : ":category",
                children : [
                    {
                        path : ":subCategory",
                        element : <LazyWrapper><ProductListPage/></LazyWrapper>
                    }
                ]
            },
            {
                path : "product/:product",
                element : <LazyWrapper><ProductDisplayPage/></LazyWrapper>
            },
            {
                path : 'cart',
                element : <LazyWrapper><CartMobile/></LazyWrapper>
            },
            {
                path : "checkout",
                element : <LazyWrapper><CheckoutPage/></LazyWrapper>
            },
            {
                path : "success",
                element : <LazyWrapper><Success/></LazyWrapper>
            },
            {
                path : "cancel",
                element : <LazyWrapper><Cancel/></LazyWrapper>
            },
            {
                path : "support",
                element : <LazyWrapper><CustomerSupport/></LazyWrapper>
            },
            {
                path : "about",
                element : <LazyWrapper><About/></LazyWrapper>
            }
          
        ]
    },
    {
        path: "*",
        element: <LazyWrapper><NotFound/></LazyWrapper>
    }
])

export default router