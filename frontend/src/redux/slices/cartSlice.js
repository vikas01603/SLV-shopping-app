
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";


// Helper to load cart from local storage 
const loadCartFromStorage = () => {
    try {
        const serializedCart = localStorage.getItem("cart");
        if (serializedCart) {
            return JSON.parse(serializedCart);
        }
    } catch (e) {
        console.warn("Could not load cart from local storage", e);
    }
    return {
        cartItems: [],
        totalPrice: 0,
        totalItems: 0,
    };
};

const initialState = {
    cartItems: [], 
    totalPrice: 0,
    totalItems: 0,
    loading: false,
    error: null,
};

// ... (CreateAsyncThunks remain largely the same, but the reducer logic changes)

// Fetch Cart
export const fetchCart = createAsyncThunk("cart/fetchCart", async ({ userId, guestId }, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/cart`, {
            params: { userId, guestId },
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

// Add to Cart
export const addToCart = createAsyncThunk("cart/addToCart", async ({ userId, guestId, productId, _id, quantity, size, color }, { rejectWithValue }) => {
    try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/cart`, {
            userId, 
            guestId, 
            productId: productId || _id, // Handle both payload structures
            quantity, 
            size, 
            color
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

// Update Cart Quantity
export const updateCartItemQuantity = createAsyncThunk("cart/updateCartItemQuantity", async ({ userId, guestId, productId, quantity, size, color }, { rejectWithValue }) => {
    try {
        const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/cart`, {
            userId, guestId, productId, quantity, size, color
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

// Remove from Cart
export const removeFromCart = createAsyncThunk("cart/removeFromCart", async ({ userId, guestId, productId, size, color }, { rejectWithValue }) => {
    try {
        const response = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/cart`, {
            data: { userId, guestId, productId, size, color }
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const mergeCart = createAsyncThunk("cart/mergeCart", async ({ guestId, user }, { rejectWithValue }) => {
    try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/cart/merge`, 
            { guestId },
            { headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` } } 
        );
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        clearCart: (state) => {
            state.cartItems = [];
            state.totalPrice = 0;
            state.totalItems = 0;
            localStorage.removeItem("cart"); 
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCart.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(fetchCart.fulfilled, (state, action) => {
                state.loading = false;
                state.cartItems = action.payload.products;
                state.totalPrice = action.payload.totalPrice;
                state.totalItems = action.payload.products.reduce((acc, item) => acc + item.quantity, 0);
            })
            .addCase(fetchCart.rejected, (state, action) => { 
                state.loading = false; 
                state.error = action.payload?.message || "Failed to fetch cart"; 
            })
            
            .addCase(addToCart.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(addToCart.fulfilled, (state, action) => {
                state.loading = false;
                state.cartItems = action.payload.products;
                state.totalPrice = action.payload.totalPrice;
                state.totalItems = action.payload.products.reduce((acc, item) => acc + item.quantity, 0);
                localStorage.setItem("cart", JSON.stringify(action.payload)); 
            })
            .addCase(addToCart.rejected, (state, action) => {
                 state.loading = false; 
                 state.error = action.payload?.message || "Failed to add to cart"; 
            })

            .addCase(updateCartItemQuantity.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(updateCartItemQuantity.fulfilled, (state, action) => {
                state.loading = false;
                state.cartItems = action.payload.products;
                state.totalPrice = action.payload.totalPrice;
                state.totalItems = action.payload.products.reduce((acc, item) => acc + item.quantity, 0);
                localStorage.setItem("cart", JSON.stringify(action.payload)); 
            })
             .addCase(updateCartItemQuantity.rejected, (state, action) => {
                 state.loading = false; 
                 state.error = action.payload?.message || "Failed to update quantity"; 
            })

            .addCase(removeFromCart.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(removeFromCart.fulfilled, (state, action) => {
                state.loading = false;
                state.cartItems = action.payload.products;
                state.totalPrice = action.payload.totalPrice;
                state.totalItems = action.payload.products.reduce((acc, item) => acc + item.quantity, 0);
                localStorage.setItem("cart", JSON.stringify(action.payload)); 
            })
             .addCase(removeFromCart.rejected, (state, action) => {
                 state.loading = false; 
                 state.error = action.payload?.message || "Failed to remove item"; 
            })

            .addCase(mergeCart.pending, (state) => { state.loading = true; state.error = null; })
            .addCase(mergeCart.fulfilled, (state, action) => {
                state.loading = false;
                state.cartItems = action.payload.products;
                state.totalPrice = action.payload.totalPrice;
                state.totalItems = action.payload.products.reduce((acc, item) => acc + item.quantity, 0);
                localStorage.setItem("cart", JSON.stringify(action.payload)); 
            })
             .addCase(mergeCart.rejected, (state, action) => { 
                state.loading = false; 
                state.error = action.payload?.message || "Failed to merge cart"; 
            });

    }
});

export const { clearCart } = cartSlice.actions;

export default cartSlice.reducer;
