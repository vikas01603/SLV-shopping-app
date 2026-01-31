import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

// Fetch User Wishlist
export const fetchWishlist = createAsyncThunk(
    "wishlist/fetchWishlist",
    async (_, { getState, rejectWithValue }) => {
        try {
            const { auth } = getState();
            // Safely access token
            const token = auth.user?.token || localStorage.getItem("userToken");

            if (!token) {
                // Or return empty array, or reject.
                // If the logic assumes we only fetch when logged in, maybe this is fine,
                // but safely returning avoids the crash.
                return rejectWithValue("User not authenticated");
            }

            const response = await axios.get(`${API_URL}/api/users/wishlist`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

// Toggle Product in Wishlist
export const toggleWishlist = createAsyncThunk(
    "wishlist/toggleWishlist",
    async ({ productId, product }, { getState, rejectWithValue }) => {
        try {
            const { auth } = getState();
            const token = auth.user?.token || localStorage.getItem("userToken");

            if (!token) {
                return rejectWithValue("User not authenticated");
            }

            const response = await axios.post(
                `${API_URL}/api/users/wishlist`,
                { productId },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            return { data: response.data, addedProduct: product };
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || error.message);
        }
    }
);

const wishlistSlice = createSlice({
    name: "wishlist",
    initialState: {
        wishlist: [],
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            // Fetch Wishlist
            .addCase(fetchWishlist.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchWishlist.fulfilled, (state, action) => {
                state.loading = false;
                state.wishlist = action.payload;
            })
            .addCase(fetchWishlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Toggle Wishlist
            .addCase(toggleWishlist.pending, (state) => {
                // Optimistic update could go here, but for now we'll wait
            })
            .addCase(toggleWishlist.fulfilled, (state, action) => {
                const { productId, product } = action.meta.arg;
                // If we are calling from ProductDetails, we pass { productId, product }
                // If we are calling from Wishlist (remove), we might just pass { productId } or just productId if I didn't update call sites.
                // Wait, if call site passes just ID, action.meta.arg will be that ID.
                // We need to handle both cases to be safe or update all call sites.
                // Since I updated the thunk signature to destructure `{ productId, product }`, 
                // all calls MUST pass an object.

                const index = state.wishlist.findIndex(item => item._id === productId);

                if (index >= 0) {
                    // Item exists, remove it
                    state.wishlist.splice(index, 1);
                } else if (product) {
                    // Item doesn't exist, and we have product data, add it
                    state.wishlist.push(product);
                }
            });
    },
});

export default wishlistSlice.reducer;
