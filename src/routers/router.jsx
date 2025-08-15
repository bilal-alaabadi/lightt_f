import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Home from "../pages/home/Home";
import CategoryPage from "../pages/category/CategoryPage";
import Search from "../pages/search/Search";
import ShopPage from "../pages/shop/ShopPage";
import SingleProduct from "../pages/shop/productDetails/SingleProduct";
import Login from "../components/Login";
import Register from "../components/Register";
import DashboardLayout from "../pages/dashbord/DashboardLayout";
import PrivateRoute from "./PrivateRoute";
import UserDMain from "../pages/dashbord/user/dashboard/UserDMain";
import UserOrders from "../pages/dashbord/user/dashboard/UserOrders";
import PaymentSuccess from "../components/PaymentSuccess";
import OrderDetails from "../pages/dashbord/user/OrderDetails";
import UserPayments from "../pages/dashbord/user/dashboard/UserPayments";
import UserReviews from "../pages/dashbord/user/dashboard/UserReviews";
import UserProfile from "../pages/dashbord/user/dashboard/UserProfile";
import AdminDMain from "../pages/dashbord/admin/dashboard/AdminDMain";
import AddProduct from "../pages/dashbord/admin/addProduct/AddProduct";
import MangeProduct from "../pages/dashbord/admin/manageProduct/MangeProduct";
import MangeUser from "../pages/dashbord/admin/users/MangeUser";
import ManageOrders from "../pages/dashbord/admin/manageOrders/ManageOrders";
import UpdateProduct from "../pages/dashbord/admin/manageProduct/UpdateProduct";
import Checkout from "../pages/shop/Checkout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { path: "", element: <Home /> },
      { path: "categories/:categoryName", element: <CategoryPage /> },
      {path:"/search",element:<Search/>},
      { path: "Shop", element: <ShopPage /> },
      { path: "Shop/:id", element: <SingleProduct /> },
      { path: "success", element: <PaymentSuccess /> },
      { path: "orders/:orderId", element: <OrderDetails /> },
      { path: "checkout", element: <Checkout /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      {
        path: "dashboard",
        element: (
          <PrivateRoute>
            <DashboardLayout />
          </PrivateRoute>
        ),
        children: [
          // user routes
          { path: "", element: <UserDMain /> },
          { path: "orders", element: <UserOrders /> },
          { path: "payments", element: <UserPayments /> },
          { path: "profile", element: <UserProfile /> },
          { path: "reviews", element: <UserReviews /> },

          // admin routes
          {
            path: "admin",
            element: (
              <PrivateRoute role="admin">
                <AdminDMain />
              </PrivateRoute>
            ),
          },
          {
            path: "add-product",
            element: (
              <PrivateRoute role="admin">
                <AddProduct />
              </PrivateRoute>
            ),
          },
          {
            path: "manage-products",
            element: (
              <PrivateRoute role="admin">
                <MangeProduct />
              </PrivateRoute>
            ),
          },
          {
            path: "update-product/:id",
            element: (
              <PrivateRoute role="admin">
                <UpdateProduct />
              </PrivateRoute>
            ),
          },
          {
            path: "users",
            element: (
              <PrivateRoute role="admin">
                <MangeUser />
              </PrivateRoute>
            ),
          },
          {
            path: "manage-orders",
            element: (
              <PrivateRoute role="admin">
                <ManageOrders />
              </PrivateRoute>
            ),
          }
        ],
      },
    ],
  },
]);

export default router;