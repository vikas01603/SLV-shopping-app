import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const API_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const getHeader = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem("userToken")}` }
});

export const fetchMetrics = createAsyncThunk("security/fetchMetrics", async (_, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${API_URL}/api/admin/security/metrics`, getHeader());
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch metrics");
    }
});

export const fetchLogs = createAsyncThunk("security/fetchLogs", async (params, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${API_URL}/api/admin/security/logs`, {
            params,
            ...getHeader()
        });
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch logs");
    }
});

export const fetchAlerts = createAsyncThunk("security/fetchAlerts", async (_, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${API_URL}/api/admin/security/alerts`, getHeader());
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch alerts");
    }
});

export const resolveAlert = createAsyncThunk("security/resolveAlert", async (alertId, { rejectWithValue }) => {
    try {
        const response = await axios.put(`${API_URL}/api/admin/security/alerts/${alertId}/resolve`, {}, getHeader());
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to resolve alert");
    }
});

export const fetchBlocks = createAsyncThunk("security/fetchBlocks", async (_, { rejectWithValue }) => {
    try {
        const response = await axios.get(`${API_URL}/api/admin/security/blocks`, getHeader());
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to fetch blocks");
    }
});

export const createBlock = createAsyncThunk("security/createBlock", async (blockData, { rejectWithValue }) => {
    try {
        const response = await axios.post(`${API_URL}/api/admin/security/blocks`, blockData, getHeader());
        return response.data;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to create block");
    }
});

export const removeBlock = createAsyncThunk("security/removeBlock", async (blockId, { rejectWithValue }) => {
    try {
        await axios.delete(`${API_URL}/api/admin/security/blocks/${blockId}`, getHeader());
        return blockId;
    } catch (error) {
        return rejectWithValue(error.response?.data?.message || "Failed to remove block");
    }
});

const securitySlice = createSlice({
    name: "security",
    initialState: {
        metrics: null,
        logs: [],
        alerts: [],
        blocks: [],
        loading: false,
        error: null,
        totalLogs: 0,
        totalPages: 0,
        currentPage: 1
    },
    reducers: {
        addLog: (state, action) => {
            state.logs.unshift(action.payload);
        },
        addAlert: (state, action) => {
            state.alerts.unshift(action.payload);
            if (state.metrics) state.metrics.unresolvedAlerts++;
        }
    },
    extraReducers: (builder) => {
        builder
            // Fulfilled states
            .addCase(fetchMetrics.fulfilled, (state, action) => {
                state.loading = false;
                state.metrics = action.payload;
            })
            .addCase(fetchLogs.fulfilled, (state, action) => {
                state.loading = false;
                state.logs = action.payload.logs;
                state.totalLogs = action.payload.totalLogs;
                state.totalPages = action.payload.totalPages;
                state.currentPage = action.payload.currentPage;
            })
            .addCase(fetchAlerts.fulfilled, (state, action) => {
                state.loading = false;
                state.alerts = action.payload;
            })
            .addCase(resolveAlert.fulfilled, (state, action) => {
                state.loading = false;
                const index = state.alerts.findIndex(a => a._id === action.payload._id);
                if (index !== -1) state.alerts[index] = action.payload;
                if (state.metrics) state.metrics.unresolvedAlerts--;
            })
            .addCase(fetchBlocks.fulfilled, (state, action) => {
                state.loading = false;
                state.blocks = action.payload;
            })
            .addCase(createBlock.fulfilled, (state, action) => {
                state.loading = false;
                state.blocks.push(action.payload);
            })
            .addCase(removeBlock.fulfilled, (state, action) => {
                state.loading = false;
                state.blocks = state.blocks.filter(b => b._id !== action.payload);
            })
            // Pending states
            .addMatcher(
                (action) => action.type.endsWith("/pending") && action.type.startsWith("security/"),
                (state) => {
                    state.loading = true;
                    state.error = null;
                }
            )
            // Rejected states
            .addMatcher(
                (action) => action.type.endsWith("/rejected") && action.type.startsWith("security/"),
                (state, action) => {
                    state.loading = false;
                    state.error = action.payload;
                }
            );
    }
});

export const { addLog, addAlert } = securitySlice.actions;
export default securitySlice.reducer;
