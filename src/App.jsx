import { createBrowserRouter, RouterProvider } from "react-router-dom"
import Home from "./ui/Home"
import Menu from "./features/menu/Menu"
import Cart from "./features/cart/Cart"
import Order from "./features/order/Order"
import CreateOrder from "./features/order/CreateOrder"
import OrderItem from "./features/order/OrderItem"
function App() {

  const router = createBrowserRouter([
    {
      path: '/',
      element: <Home />
    },
    {
      path: '/menu',
      element: <Menu />
    },
    {
      path: '/cart',
      element: <Cart />
    },
    {
      path: '/order',
      element: <Order />
    },
    {
      path: '/order/new',
      element: <CreateOrder />
    },
    {
      path: '/order/:id',
      element: <OrderItem />
    },
  ])

  return (
    <RouterProvider router={router} />
  )
}

export default App
