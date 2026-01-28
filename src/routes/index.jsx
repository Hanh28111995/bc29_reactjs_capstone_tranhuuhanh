import React, { lazy } from "react";
import { useRoutes, Navigate } from "react-router-dom";
import PageNotFound from "pages/PageNotFound/PageNotFound";
import SeatTypeTable from "pages/theater-management/SeatTypesTable";
import BranchesTable from "pages/theater-management/BranchesTable";
import ShowTimesManagement from "pages/theater-management/ShowTimesManagement";
import TheatersManagement from "pages/theater-management/TheaterManagement";
import CreateTheater from "pages/CreateTheater/CreateTheater";
import Payment from "pages/payment/Payment";

const Login = lazy(() => import("pages/login/Login"));
const Register = lazy(() => import("pages/register/Register"));
const AdminGuards = lazy(() => import("guards/admin.guards"));
const AuthGuards = lazy(() => import("guards/auth.guards"));
const NoAuthGuards = lazy(() => import("guards/no-auth.guards"));

const AdminLayout = lazy(() => import("../layouts/AdminLayout"));
const MovieManagement = lazy(() => import("pages/movie-management/MovieManagement"));
const UserManagement = lazy(() => import("pages/user-management/UserManagement"));
const CreateUser = lazy(() => import("pages/CreateUser/CreateUser"));
const EditShowTime = lazy(() => import("pages/EditShowTime/EditShowTime"));
const UpdateMovie = lazy(() => import("pages/EditMovie/UpdateMovie"));

const Home = lazy(() => import("pages/home/Home"));
const HomeLayout = lazy(() => import("../layouts/HomeLayout"));
const MovieDetail = lazy(() => import("pages/movie-detail/MovieDetail"));
const MovieDtail = lazy(() => import("pages/movie-detail/MovieDtail"));
const MovieTheater = lazy(() => import("pages/MovieTheater/MovieTheater"));
const Booking = lazy(() => import("pages/booking/Booking"));

export default function Router() {
  const routing = useRoutes([
    {
      path: "/",
      element: <HomeLayout />,
      children: [
        {
          path: "/",
          element: <Home />,
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
          path: "/movie-theater",
          element: <MovieTheater />,
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
          path: '/admin/',
          element: <AdminGuards />,
          children: [
            {
              path: '/admin/',
              element: <Navigate to='/admin/movie-management' />,
            },
            {
              path: '/admin/movie-management',
              element: <MovieManagement />,
            },
            {
              path: '/admin/user-management',
              element: <UserManagement />,
            },
            {
              path: '/admin/seat-types',
              element: <SeatTypeTable />,
            },
            {
              path: '/admin/branches',
              element: <BranchesTable />,
            },
            {
              path: '/admin/theater-management',
              element: <TheatersManagement />,
            },
            {
              path: '/admin/showtimes',
              element: <ShowTimesManagement />,
            },
            {
              path: '/admin/movie-management/create',
              element: <UpdateMovie />,
            },
            {
              path: '/admin/user-management/create',
              element: <CreateUser />,
            },
            {
              path: '/admin/showtimes/create',
              element: <EditShowTime />,
            },
            {
              path: '/admin/theater-management/create',
              element: <CreateTheater />,
            },
            {
              path: '/admin/movie-management/:movieId/update',
              element: <UpdateMovie />,
            },
            {
              path: '/admin/theater-management/:theaterId/update',
              element: <CreateTheater />,
            },
            {
              path: '/admin/user-management/:tk/edit',
              element: <CreateUser />,
            },
            {
              path: '/admin/showtimes/:id/update',
              element: <EditShowTime />,
            },
          ]
        }
      ]
    },
    {
      path: '*',
      element: <PageNotFound />
    },
  ]);
  return routing;
}
