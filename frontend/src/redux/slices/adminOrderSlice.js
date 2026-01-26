import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import axios from "axios";

//Async thunk to fetch admin orders
export const fetchAllOrders = createAsyncThunk("adminOrders/fetchAllOrders", 
    async(_, {rejectWithValue}) => {
    try {
        const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/orders`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("userToken")}`
                },
            }
        );
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

//update order delivery status
export const updateOrderStatus = createAsyncThunk("adminOrders/updateOrderStatus", 
    async({id, status}, {rejectWithValue}) => {
    try {
        const response = await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/admin/orders/${id}`,
            {status},
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("userToken")}`
                },
            }
        );
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

//deleting order
export const deleteOrder = createAsyncThunk("adminOrders/deleteOrder", 
    async(id, {rejectWithValue}) => {
    try {
        const response = await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/admin/orders/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("userToken")}`
                },
            }
        );
        return id;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

const adminOrderSlice = createSlice({
    name: "adminOrders",
    initialState: {
        orders: [],
        totalOrders: 0,
        totalSales: 0,
        loading: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
        //fetch all orders
        .addCase(fetchAllOrders.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchAllOrders.fulfilled, (state, action) => {
            state.loading = false;
            state.orders = action.payload; // Payload is the array of orders
            state.totalOrders = action.payload.length;
            state.totalSales = action.payload.reduce((acc, order) => {
                return acc + order.totalPrice;
            }, 0);
        })
        .addCase(fetchAllOrders.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload.message;
        })
        // update order status
        .addCase(updateOrderStatus.fulfilled, (state, action)=> {
            const updatedOrder = action.payload;
            const orderIndex = state.orders.findIndex((order) => order._id === updatedOrder._id);
            if(orderIndex !== -1){
                state.orders[orderIndex] = updatedOrder;
            }
        })
        //Delete order
        .addCase(deleteOrder.fulfilled, (state, actino) => {
            state.orders = state.orders.filter((order) => order._id !== action.payload);
        })
    },
});

export default adminOrderSlice.reducer;
