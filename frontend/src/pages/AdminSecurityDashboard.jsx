import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMetrics, fetchAlerts, addLog, addAlert } from "../redux/slices/securitySlice";
import SecurityMetrics from "../components/Admin/Security/SecurityMetrics";
import SecurityLogs from "../components/Admin/Security/SecurityLogs";
import SecurityAlerts from "../components/Admin/Security/SecurityAlerts";
import SecurityBlocks from "../components/Admin/Security/SecurityBlocks";
import { motion } from "framer-motion";
import { FaShieldAlt, FaSyncAlt, FaExclamationTriangle } from "react-icons/fa";

import { io } from "socket.io-client";

const AdminSecurityDashboard = () => {
  const dispatch = useDispatch();
  const { metrics, loading, error } = useSelector((state) => state.security);
  const token = localStorage.getItem("userToken");

  useEffect(() => {
    dispatch(fetchMetrics());
    dispatch(fetchAlerts());

    // Socket.io for real-time security events
    const socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:3000", {
        auth: { token }
    });

    socket.on("new_security_log", (log) => {
        dispatch(addLog(log));
        dispatch(fetchMetrics()); // Refresh metrics on new activity
    });

    socket.on("new_security_alert", (alert) => {
        dispatch(addAlert(alert));
    });

    return () => {
        socket.disconnect();
    };
  }, [dispatch, token]);

  const refreshDashboard = () => {
    dispatch(fetchMetrics());
    dispatch(fetchAlerts());
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 py-6 px-4">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-600 to-black p-8 md:p-10 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="flex items-center gap-3 mb-4"
            >
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                <FaShieldAlt className="text-2xl" />
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight uppercase">
                Security Command Center
              </h1>
            </motion.div>
            <motion.p 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="text-red-100/80 text-sm md:text-lg max-w-2xl font-medium tracking-wide"
            >
              Real-time threat detection, activity monitoring, and access control management for SLV Shopping App.
            </motion.p>
          </div>
          <button 
            onClick={refreshDashboard}
            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 px-6 py-3 rounded-2xl text-sm font-bold transition-all hover:-rotate-3 active:scale-95"
          >
            <FaSyncAlt className={loading ? "animate-spin" : ""} /> REFRESH
          </button>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
      </div>

      {loading && !metrics ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-12 h-12 border-4 border-black border-t-red-600 rounded-full animate-spin"></div>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Initializing Security Systems...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-red-50 border-2 border-red-100 rounded-3xl text-red-600 text-sm font-bold flex items-center gap-3">
          <FaExclamationTriangle size={24} /> {error}
        </div>
      ) : (
        <motion.div 
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           className="space-y-8"
        >
          {/* Metrics Overview */}
          <SecurityMetrics metrics={metrics} />

          {/* Core Security Functional Areas */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <SecurityAlerts />
            <SecurityBlocks />
          </div>

          <SecurityLogs />
        </motion.div>
      )}
    </div>
  );
};

export default AdminSecurityDashboard;
