import React from "react";

import { useRoutes } from "react-router-dom";
import AdminGuards from "../guards/admin.guards";
import AuthGuards from "../guards/auth.guards";
import NoAuthGuards from "../guards/no-auth.guards";
import AdminLayout from "../layouts/AdminLayout";
import HomeLayout from "../layouts/HomeLayout";
import Booking from "../pages/booking/Booking";
import Home from "../pages/home/Home";
import Login from "../pages/login/Login";
import MovieDetail from "../pages/movie-detail/MovieDetail";
import MovieManagement from "../pages/movie-management/MovieManagement";

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
              path: '/admin/movie-management',
              element:<MovieManagement/>,
            }
          ]
        }
      ]
    }
  ]);
  return routing;
}
