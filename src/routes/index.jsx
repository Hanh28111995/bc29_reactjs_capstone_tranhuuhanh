import React, { lazy } from "react";
import { useRoutes, Navigate } from "react-router-dom";
import PageNotFound from "pages/PageNotFound/PageNotFound";

const Login = lazy(() => import("pages/login/Login"));
const Register = lazy(() => import("pages/register/Register"));
const AdminGuards = lazy(() => import("guards/admin.guards"));
const AuthGuards = lazy(() => import("guards/auth.guards"));
const NoAuthGuards = lazy(() => import("guards/no-auth.guards"));

const AdminLayout = lazy(() => import("../layouts/AdminLayout"));
const MovieManagement = lazy(() => import("pages/movie-management/MovieManagement"));
const UserManagement = lazy(() => import("pages/user-management/UserManagement"));
const CreateMovie = lazy(() => import("pages/CreateMovie/CreateMovie"));
const CreateUser = lazy(() => import("pages/CreateUser/CreateUser"));
const EditShowTime = lazy(() => import("pages/EditShowTime/EditShowTime"));
const EditUser = lazy(() => import("pages/EditUser/EditUser"));
const UpdateMovie = lazy(() => import("pages/UpdateMovie/UpdateMovie"));

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
              path: "/booking/:maLichChieu",
              element: <Booking />,
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
              path: '/admin/movie-management/create',
              element: <CreateMovie />,
            },
            {
              path: '/admin/user-management/create',
              element: <CreateUser />,
            },
            {
              path: '/admin/movie-management/:movieId/update',
              element: <UpdateMovie />,
            },
            {
              path: '/admin/user-management/:tk/edit',
              element: <EditUser />,
            },
            {
              path: '/admin/movie-management/:movieId/edit-showtime',
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
