import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import axios from "axios";

//Async thunk to fetch all user orders
const API_URL = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

export const fetchUserOrders = createAsyncThunk("order/fetchUserOrders", async (_, {rejectWithValue})=> {
    try{
        const response = await axios.get(`${API_URL}/api/orders/my-orders`,{
            headers: {
                Authorization: `Bearer ${localStorage.getItem("userToken")}`,
            }
        });
        return response.data;
    }catch(error){
        return rejectWithValue(error.response.data);
    }
});

//Async thunk to fetch specific order details by ID
export const fetchOrderDetails = createAsyncThunk("order/fetchOrderDetails",async(orderId, {rejectWithValue})=> {
    try {
        const response = await axios.get(`${API_URL}/api/orders/${orderId}`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("userToken")}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

const orderSlice = createSlice({
    name: "order",
    initialState: {
        orders: [],
        totalOrders:0,
        orderDetails: null,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
        //Fetch user orders
        .addCase(fetchUserOrders.pending, (state)=> {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchUserOrders.fulfilled, (state, action)=> {
            state.loading = false;
            state.orders = action.payload;
        })
        .addCase(fetchUserOrders.rejected, (state, action)=> {
            state.loading = false;
            state.error = action.payload.message;
        })
        //fetch order details
        .addCase(fetchOrderDetails.pending, (state)=> {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchOrderDetails.fulfilled, (state, action)=> {
            state.loading = false;
            state.orderDetails = action.payload;
        })
        .addCase(fetchOrderDetails.rejected, (state, action)=> {
            state.loading = false;
            state.error = action.payload.message;
        })
    },
});

export default orderSlice.reducer;

