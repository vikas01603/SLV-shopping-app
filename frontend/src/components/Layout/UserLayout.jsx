import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Footer from "../Common/Footer";
import Header from "../Common/Header";
import { useDispatch, useSelector } from "react-redux";
import { fetchWishlist } from "../../redux/slices/wishlistSlice";
import { fetchCart } from "../../redux/slices/cartSlice";

const UserLayout = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const { cartItems } = useSelector((state) => state.cart);

  useEffect(() => {
    if (user && cartItems.length === 0) {
      dispatch(fetchCart({ userId: user._id }));
    }

    if (user) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, user, cartItems.length]);

  return (
    <>
      {/* Header */}
      <Header />
      {/* Main Content */}
      <main>
        <Outlet />
      </main>
      {/* Footer */}
      <Footer />
    </>
  );
};

export default UserLayout;