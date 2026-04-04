import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchLogs } from "../../../redux/slices/securitySlice";
import { FaDownload, FaSearch, FaFilter, FaChevronLeft, FaChevronRight } from "react-icons/fa";

const SecurityLogs = () => {
    const dispatch = useDispatch();
    const { logs, totalPages, currentPage } = useSelector((state) => state.security);
    const [page, setPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    useEffect(() => {
        dispatch(fetchLogs({ page, type: searchTerm, status: statusFilter }));
    }, [dispatch, page, searchTerm, statusFilter]);

    const handleExportCSV = () => {
        const headers = "Timestamp,Action,Status,IP,User,Device\n";
        const rows = logs.map(log => 
            `${new Date(log.timestamp).toLocaleString()},${log.action},${log.status},${log.ip},${log.userId?.email || 'Guest'},${log.deviceInfo?.browser || 'Other'}`
        ).join("\n");
        
        const blob = new Blob([headers + rows], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `security_logs_${new Date().toISOString()}.csv`;
        a.click();
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-black">Activity Logs</h2>
                <div className="flex flex-wrap items-center gap-2">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                        <input 
                            type="text" 
                            placeholder="Search actions..." 
                            className="text-xs pl-8 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select 
                        className="text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="">All Status</option>
                        <option value="SUCCESS">Success</option>
                        <option value="FAILED">Failed</option>
                    </select>
                    <button 
                        onClick={handleExportCSV}
                        className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-neutral-800 transition-colors"
                    >
                        <FaDownload /> Export
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50/50 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-bold">
                            <th className="py-4 px-8">Timestamp</th>
                            <th className="py-4 px-8">Action</th>
                            <th className="py-4 px-8">User</th>
                            <th className="py-4 px-8">IP Address</th>
                            <th className="py-4 px-8">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 text-xs">
                        {logs.length > 0 ? logs.map((log) => (
                            <tr key={log._id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="py-4 px-8 text-gray-500 whitespace-nowrap">
                                    {new Date(log.timestamp).toLocaleString()}
                                </td>
                                <td className="py-4 px-8 font-medium">
                                    <span className="text-xs text-black block max-w-[200px] truncate" title={log.action}>
                                        {log.action}
                                    </span>
                                </td>
                                <td className="py-4 px-8">
                                    <div className="flex flex-col">
                                        <span className="font-semibold">{log.userId?.name || log.adminId?.name || "Guest"}</span>
                                        <span className="text-[10px] text-gray-400 capitalize">{log.userId?.role || "Visitor"}</span>
                                    </div>
                                </td>
                                <td className="py-4 px-8 font-mono text-gray-400">
                                    {log.ip}
                                </td>
                                <td className="py-4 px-8">
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                        log.status === "SUCCESS" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                                    }`}>
                                        {log.status}
                                    </span>
                                </td>
                            </tr>
                        )) : (
                            <tr><td colSpan="5" className="py-12 text-center text-gray-400">No logs found</td></tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-gray-50 flex items-center justify-between">
                <span className="text-xs text-gray-400">Page {currentPage} of {totalPages}</span>
                <div className="flex gap-2">
                    <button 
                        disabled={page <= 1}
                        onClick={() => setPage(p => p - 1)}
                        className="p-2 border border-gray-200 rounded-lg disabled:opacity-30"
                    >
                        <FaChevronLeft size={10} />
                    </button>
                    <button 
                        disabled={page >= totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="p-2 border border-gray-200 rounded-lg disabled:opacity-30"
                    >
                        <FaChevronRight size={10} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SecurityLogs;
