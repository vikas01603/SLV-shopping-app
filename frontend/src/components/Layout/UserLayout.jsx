import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Footer from "../Common/Footer";
import Header from "../Common/Header";
import { useDispatch, useSelector } from "react-redux";
import { fetchWishlist } from "../../redux/slices/wishlistSlice";

const UserLayout = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchWishlist());
    }
  }, [dispatch, user]);

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