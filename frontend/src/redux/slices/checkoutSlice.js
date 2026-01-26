import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import axios from "axios";

//Async thunk to create a checkout session
export const createCheckoutSession = createAsyncThunk("checkout/createCheckout", async (checkoutdata,{rejectWithValue}) => {
    try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/checkout`, checkoutdata,
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
const checkoutSlice = createSlice({
    name:"checkout",
    initialState:{
        checkout:null,
        loading:false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
        .addCase(createCheckoutSession.pending, (state)=> {
            state.loading = true;
            state.error = null;
        })
        .addCase(createCheckoutSession.fulfilled, (state, action)=> {
            state.loading = false;
            state.checkout = action.payload;
        })
        .addCase(createCheckoutSession.rejected, (state, action)=> {
            state.loading = false;
            state.error = action.payload.message;
        });
    },
});
export default checkoutSlice.reducer;
