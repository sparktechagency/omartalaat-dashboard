import { createBrowserRouter } from "react-router-dom";
import Auth from "../Layout/Auth/Auth";
import Main from "../Layout/Main/Main";
import Home from "../Pages/Dashboard/Home";
import Users from "../Pages/Dashboard/Subsciber";
import Admin from "../Pages/Dashboard/Admin";
import Category from "../Pages/Dashboard/PushNotification";
import Events from "../Pages/Dashboard/UpdatePassword";
import Banner from "../Pages/Dashboard/Banner";
import AboutUs from "../Pages/Dashboard/AboutUs";
import PrivacyPolicy from "../Pages/Dashboard/PrivacyPolicy";
import TermsAndConditions from "../Pages/Dashboard/TermsAndCondition";
import ChangePassword from "../Pages/Auth/ChangePassword";
import Login from "../Pages/Auth/Login";
import ForgotPassword from "../Pages/Auth/ForgotPassword";
import VerifyOtp from "../Pages/Auth/VerifyOtp";
import ResetPassword from "../Pages/Auth/ResetPassword";
import NotFound from "../NotFound";
import Notifications from "../Pages/Dashboard/Notifications";
import SubCategory from "../Pages/Dashboard/SubCategory";
import AdminProfile from "../Pages/Dashboard/AdminProfile/AdminProfile";
import Retailer from "../Pages/Dashboard/Retailer";
import ViewSalesReps from "../components/SalesRepsManagement/detailsSalesReps/SubCategoryTable";
import Products from "../Pages/Dashboard/Products";
import LoyaltyProgram from "../Pages/Dashboard/LoyaltyProgram";
// import OrderManagementContainer from "../components/orderMangement/OrderManagementContainer";
import VideoManagementSystem from "../components/retailerManagement/RetailerManageTable";
// import CategoryManagement from "../components/SalesRepsManagement/SalesRepsManagement";
import Subsciber from "../Pages/Dashboard/Subsciber";
import SubscriptionManagements from "../components/subscriptionmanagement/SubscriptionManagements";
import QuotationManagement from "../components/quatation/QuatationManagement";
import SubCategoryManagement from "../components/SalesRepsManagement/detailsSalesReps/CategoryDetails";
import LoginCredentials from "../components/loginCredentials/LoginCredentials";
import CommingSoonVideoPage from "../components/comingSoon/CommingSoonVideoPage";
import TodayVideos from "../components/todayVideos/TodayVideos";
import ChallengeDetails from "../components/todayVideos/ChallengeDetails";
import CourseDetailsVideoManagement from "../components/retailerManagement/CourseDetailsVideoManagement";
import DailyInspirationPage from "../components/comingSoon/DailyInspiration";
import PostManagementSystem from "../components/createPost/CreatePostManagement";
import PageManagement from "../Pages/Dashboard/LoginAndRegisterBG";
import ContactManagementTable from "../components/contactus/ContactUsUser";
import SubscriptionManagementTable from "../components/subscriptionUser/SubscriptionUser";
import AllVideos from "../components/SalesRepsManagement/AllVideos";
import PrivateRoute from "./ProtectedRoute";
import CategoryManagement from "../components/categoryManagement/CategoryManagent";
import PromoCodeManagement from "../components/promoCode/PromoCodeManagement";
import AllProducts from "../components/Products/AllProducts";
import TotalEarning from "../components/totalEarning/TotalEarning";
import UserManagementTable from "../components/userManagement/UserManagementTable";
import OrderManagementContainer from "../components/orderMangement/OrderManagementContainer";
import AuctionManagement from "../components/auctions/AuctionManagement";
// import SalesRepsManagementTable from "../components/SalesRepsManagement/SalesRepsManagement";

const router = createBrowserRouter([
  {
    path: "/",
    element: <PrivateRoute><Main /></PrivateRoute> ,
    // element: <Main />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/user-management",
        element: <UserManagementTable />,

      },
      {
        path: "/order-management",
        element: <OrderManagementContainer />,

      },
      {
        path: "/salesManagement",
        element: <VideoManagementSystem />,
      },
      {
        path: "/product-management",
        element: <AllProducts />,
      },
      {
        path: "/video-management/:subCategoryId",
        element: <CourseDetailsVideoManagement />,
      },
      {
        path: "/category-management",
        element: <CategoryManagement />,
      },
      {
        path: "/subcategory-management/:categoryId",
        element: <SubCategoryManagement />,
      },
      {
        path: "/category-management/:categoryId",
        element: <AllVideos />,
      },
      {
        path: "/inventory",
        element: <QuotationManagement />,
      },
      {
        path: "/salesRepsManage/:id",
        element: <ViewSalesReps />,
      },
      {
        path: "/promo-code",
        element: <PromoCodeManagement />,
      },
      {
        path: "/auction-management",
        element: <AuctionManagement />,
      },
      {
        path: "/loyalty-program",
        element: <SubscriptionManagements />,
      },
      {
        path: "/coming-soon",
        element: <CommingSoonVideoPage />,
      },
      {
        path: "/total-earning",

        element: <TotalEarning />,

      },
      {
        path: "/challenge-details/:id",
        element: <ChallengeDetails />,
      },
      {
        path: "/daily-inspiration",
        element: <DailyInspirationPage />,
      },
      {
        path: "/login-credentials",
        element: <LoginCredentials />,
      },
      {
        path: "/create-post",
        element: <PostManagementSystem />,
      },
      {
        path: "/subsciption",
        element: <Subsciber />,
      },
      {
        path: "/category",
        element: <Category />,
      },
      {
        path: "/login-register",
        element: <PageManagement />,
      },
      {
        path: "/contactUs",
        element: <ContactManagementTable />,
      },
      {
        path: "/subcription-user",
        element: <SubscriptionManagementTable />,
      },
      {
        path: "/banner",
        element: <Banner />,
      },
      {
        path: "/about-us",
        element: <AboutUs />,
      },
      {
        path: "/privacy-policy",
        element: <PrivacyPolicy />,
      },
      {
        path: "/terms-and-conditions",
        element: <TermsAndConditions />,
      },
      {
        path: "/change-password",
        element: <ChangePassword />,
      },
      {
        path: "/sub-category",
        element: <SubCategory />,
      },
      {
        path: "/profile",
        element: <AdminProfile />,
      },
      {
        path: "/notification",
        element: <Notifications />,
      },
    ],
  },
  {
    path: "/auth",
    element: <Auth />,
    children: [
      {
        path: "/auth",
        element: <Login />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "verify-otp",
        element: <VerifyOtp />,
      },
      {
        path: "reset-password",
        element: <ResetPassword />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
