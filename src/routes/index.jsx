import CreateMovie from "pages/CreateMovie/CreateMovie";
import CreateUser from "pages/CreateUser/CreateUser";
import EditShowTime from "pages/EditShowTime/EditShowTime";
import EditUser from "pages/EditUser/EditUser";
import Register from "pages/register/Register";
import UpdateMovie from "pages/UpdateMovie/UpdateMovie";
import UserManagement from "pages/user-management/UserManagement";
import PageNotFound from "pages/PageNotFound/PageNotFound";

import React, { lazy } from "react";

import { useRoutes, Navigate } from "react-router-dom";
const Booking = lazy(()=> import( "pages/booking/Booking"));
const Login = lazy(()=> import( "pages/login/Login"));
const MovieManagement = lazy(()=> import( "pages/movie-management/MovieManagement"));
const AdminGuards = lazy(()=> import( "guards/admin.guards"));
const AuthGuards = lazy(()=> import( "guards/auth.guards"));
const NoAuthGuards = lazy(()=> import( "guards/no-auth.guards"));
const AdminLayout = lazy(()=> import( "../layouts/AdminLayout"));
const HomeLayout = lazy(()=> import("../layouts/HomeLayout"));
const Home = lazy(()=> import("pages/home/Home"));
const MovieDetail = lazy(()=> import("pages/movie-detail/MovieDetail"));

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
          path: "/movie/:movieId",
          element: <MovieDetail />,
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
      path:"/admin",
      element: <AdminLayout/>,
      children: [
        {
          path: '/admin/',
          element:<AdminGuards/>,
          children: [
            {
              path: '/admin/',
              element:<Navigate to='/admin/movie-management'/>,
            },
            {
              path: '/admin/movie-management',
              element:<MovieManagement/>,
            },
            {
              path: '/admin/user-management',
              element:<UserManagement/>,
            },
            {
              path: '/admin/movie-management/create',
              element:<CreateMovie/>,
            },
            {
              path: '/admin/user-management/create',
              element:<CreateUser/>,
            },
            {
              path: '/admin/movie-management/:movieId/update',
              element:<UpdateMovie/>,
            },
            {
              path: '/admin/user-management/:tk/edit',
              element:<EditUser/>,
            },
            {
              path: '/admin/movie-management/:movieId/edit-showtime',
              element:<EditShowTime/>,
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
