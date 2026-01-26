import {createSlice, createAsyncThunk} from "@reduxjs/toolkit";
import axios from "axios";

//fetch all user (admin only)
export const fetchUsers = createAsyncThunk("admin.fetchUsers",async()=> {
    const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users`,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("userToken")}`
            },
        }
    );
    return response.data;
});

//Add the create user action
export const createUser = createAsyncThunk("admin/addUser", async(userData, {rejectWithValue})=> {
    try {
        const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users`,
            userData,
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("userToken")}`
                }
            }
        );
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

//Update the user info
export const updateUser = createAsyncThunk("admin/updateUser", async({id, name, email, role})=> {
    const response = await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/admin/users/${id}`,{name, email, role},
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("userToken")}`
            },
        }
    );
    return response.data;
});

//Delete the user
export const deleteUser = createAsyncThunk("admin/deleteUser", async(id) => {
    await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/api/admin/users/${id}`,
        {
            headers: {
                Authorization: `Bearer ${localStorage.getItem("userToken")}`
            },
        }
    );
    return id;
});

//Create the admin slice
const adminSlice = createSlice({
    name : "admin",
    initialState: {
        users: [],
        loading: false,
        error:null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
        //fetch users
        .addCase(fetchUsers.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(fetchUsers.fulfilled, (state, action) => {
            state.loading = false;
            state.users = action.payload;
        })
        .addCase(fetchUsers.rejected, (state, action) => {
            state.loading = false;
            state.error = action.payload.message;
        })
        //updateuser
        .addCase(updateUser.pending, (state) => {
            state.loading = true;
            state.error = null;
        })
        .addCase(updateUser.fulfilled,(state, action) => {
            const updatedUser = action.payload.user;
            const userIndex = state.users.findIndex((user) => user._id === updatedUser._id);
            if(userIndex !== -1){
                state.users[userIndex] = updatedUser;
            }
        })
        .addCase(updateUser.rejected, (state, action)=> {
            state.loading = false;
            state.error = action.payload.message;
        })
        //delete user
        .addCase(deleteUser.pending, (state)=> {
            state.loading = true;
            state.error = null;
        })
        .addCase(deleteUser.fulfilled, (state, action)=> {
            state.loading = false;
            state.users = state.users.filter((user) => user._id !== action.payload);
        })
        .addCase(deleteUser.rejected, (state, action)=> {
            state.loading = false;
            state.error = action.payload.message;
        })
        //add user
        .addCase(createUser.pending, (state)=>{
            state.loading = true;
            state.error = null;
        })
        .addCase(createUser.fulfilled, (state, action)=>{
            state.loading = false;
            state.users.push(action.payload.user);
        })
        .addCase(createUser.rejected, (state, action)=>{
            state.loading = false;
            state.error = action.payload.message;
        })
    }
});

export default adminSlice.reducer;
