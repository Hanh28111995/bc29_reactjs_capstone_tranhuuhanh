import React, { lazy } from "react";
import { useRoutes, Navigate } from "react-router-dom";


// --- Layouts ---
import AdminLayout from "../layouts/AdminLayout";
import HomeLayout from "../layouts/HomeLayout";

// --- Guards ---
const AuthGuards = lazy(() => import("guards/auth.guards"));
const AdminGuards = lazy(() => import("guards/admin.guards"));
const NoAuthGuards = lazy(() => import("guards/no-auth.guards"));

// --- Public Pages ---
const HeroPage = lazy(() => import("pages/heroPage/HeroPage"));
const Home = lazy(() => import("pages/home/Home"));
const MovieDetail = lazy(() => import("pages/movie-detail/MovieDetail"));
const MovieDtail = lazy(() => import("pages/movie-detail/MovieDtail"));
const MovieTheater = lazy(() => import("pages/MovieTheater/MovieTheater"));
const Booking = lazy(() => import("pages/booking/Booking"));
const Promotion = lazy(() => import("pages/promotion/Promotion"));
const PromotionDetail = lazy(() => import("modules/detail/promotionDetail"));
const Shop = lazy(() => import("pages/shop/shop"));
const ShopDetail = lazy(() => import("modules/detail/shopDetail"));
const HistoryTicket = lazy(() => import("pages/history/HistoryTicket"));

// --- Auth Pages ---
const Login = lazy(() => import("pages/login/Login"));
const Register = lazy(() => import("pages/register/Register"));

// --- Payment Pages ---
const Payment = lazy(() => import("pages/payment/Payment"));
const PaymentResult = lazy(() => import("pages/payment/PaymentResult"));

// --- Tool & Other Pages ---
const ScheduleGenerator = lazy(() => import("pages/toolManagement/ScheduleGenerator"));
const PageNotFound = lazy(() => import("pages/PageNotFound/PageNotFound"));

// --- Theater Management Pages ---
const SeatTypeTable = lazy(() => import("modules/tables/SeatTypesTable"));
const BranchesTable = lazy(() => import("modules/tables/BranchesTable"));

// --- Admin Management & Update Pages ---
const ShowTimesManagement = lazy(() => import("pages/admin/showtimeManagement/ShowTimesManagement"));
const TheatersManagement = lazy(() => import("pages/admin/theaterManagement/TheaterManagement"));
const MovieManagement = lazy(() => import("pages/admin/movieManagement/MovieManagement"));
const UpdateMovie = lazy(() => import("pages/admin/movieManagement/UpdateMovie"));

const UserManagement = lazy(() => import("pages/admin/userManagement/UserManagement"));
const UpdateUser = lazy(() => import("pages/admin/userManagement/UpdateUser"));

const TicketManagement = lazy(() => import("pages/admin/ticketManagement/TicketManagement"));
const UpdateTicket = lazy(() => import("pages/admin/ticketManagement/UpdateTicket"));

const PromotionManagement = lazy(() => import("pages/admin/promotionManagement/PromotionManagement"));
const UpdatePromotion = lazy(() => import("pages/admin/promotionManagement/UpdatePromotion"));

const ShopProductManagement = lazy(() => import("pages/admin/shopManagement/ShopProductManagement"));
const UpdateShopProduct = lazy(() => import("pages/admin/shopManagement/UpdateShopProduct"));

const UpdateShowTime = lazy(() => import("pages/admin/showtimeManagement/UpdateShowTime"));
const UpdateTheater = lazy(() => import("pages/admin/theaterManagement/UpdateTheater"));

const UpdateBanner = lazy(() => import("pages/admin/bannerManagement/UpdateBanner"));
const BannerManagement = lazy(() => import("pages/admin/bannerManagement/BannerManagement"));

export default function Router() {
  const routing = useRoutes([
    {
      path: "/",
      element: <HomeLayout />,
      children: [
        {
          path: "/",
          element: <HeroPage />,
        },
        {
          path: "/movie-search",
          element: <MovieDetail />,
        },        
        {
          path: "/movie-talk",
          element: <Home />,
        },
        {
          path: "/movie-theater",
          element: <MovieTheater />,
        },
        {
          path: "/promotion",
          element: <Promotion />,
        },
        {
          path: "/store",
          element: <Shop />,
        },
        {
          path: "/movie/selectT/:movieId",
          element: <MovieDetail />,
        },
        {
          path: "/movie/detail/:movieId",
          element: <MovieDtail />,
        },        
        {
          path: "/promotion/:id",
          element: <PromotionDetail />,
        },
        {
          path: "/shop/:id",
          element: <ShopDetail />,
        },
        {
          path: "/",
          element: <AuthGuards />,
          children: [
            {
              path: "/booking/:id",
              element: <Booking />,
            },
            {
              path: "/booking/payment/:id",
              element: <Payment />,
            },
            {
              path: "/ticket-history",
              element: <HistoryTicket />,
            },
          ],
        },

        {
          path: "/",
          element: <NoAuthGuards />,
          children: [
            {
              path: "/login",
              element: <Login />,
            },
            {
              path: "/register",
              element: <Register />,
            },
          ],
        },
      ],
    },
    {
      path: "/admin",
      element: <AdminLayout />,
      children: [
        {
          path: "/admin/",
          element: <AdminGuards />,
          children: [
            {
              path: "/admin/",
              element: <Navigate to="/admin/movie-management" />,
            },
            {
              path: "/admin/movie-management",
              element: <MovieManagement />,
            },
            {
              path: "/admin/user-management",
              element: <UserManagement />,
            },
            {
              path: "/admin/theater-management",
              element: <TheatersManagement />,
            },
            {
              path: "/admin/showtimes",
              element: <ShowTimesManagement />,
            },
            {
              path: "/admin/ticket-management",
              element: <TicketManagement />,
            },
            {
              path: "/admin/promotion-management",
              element: <PromotionManagement />,
            },
            {
              path: "/admin/shop-management",
              element: <ShopProductManagement />,
            },            
            {
              path: "/admin/tools/schedule-generator",
              element: <ScheduleGenerator />,
            },
            {
              path: "/admin/tools/banner-generator",
              element: <BannerManagement />,
            },            

            //////  Create Group //////
            {
              path: "/admin/movie-management/create",
              element: <UpdateMovie />,
            },
            {
              path: "/admin/user-management/create",
              element: <UpdateUser />,
            },
            {
              path: "/admin/showtimes/create",
              element: <UpdateShowTime />,
            },
            {
              path: "/admin/theater-management/create",
              element: <UpdateTheater />,
            },
            {
              path: "/admin/promotion-management/create",
              element: <UpdatePromotion />,
            },
            {
              path: "/admin/shop-management/create",
              element: <UpdateShopProduct />,
            },
            {
              path: "/admin/tools/banner-generator/create",
              element: <UpdateBanner />,
            },

            //////  Update Group //////
            {
              path: "/admin/ticket-management/update/:ticketId",
              element: <UpdateTicket />,
            },
            {
              path: "/admin/promotion-management/update/:promoId",
              element: <UpdatePromotion />,
            },
            {
              path: "/admin/shop-product-management/update/:productId",
              element: <UpdateShopProduct />,
            },
            {
              path: "/admin/movie-management/:movieId/update",
              element: <UpdateMovie />,
            },
            {
              path: "/admin/theater-management/:theaterId/update",
              element: <UpdateTheater />,
            },
            {
              path: "/admin/user-management/:userId/update",
              element: <UpdateUser />,
            },
            {
              path: "/admin/showtimes/:id/update",
              element: <UpdateShowTime />,
            },
            {
              path: "/admin/tools/banner-generator/update/:id",
              element: <UpdateBanner />,
            },
            ////// Update & Create thao tac chung trong Table
            {
              path: "/admin/seat-types",
              element: <SeatTypeTable />,
            },
            {
              path: "/admin/branches",
              element: <BranchesTable />,
            },
          ],
        },
      ],
    },
    {
      path: "/payment-result",
      element: <PaymentResult />,
    },
    {
      path: "*",
      element: <PageNotFound />,
    },
  ]);
  return routing;
}
