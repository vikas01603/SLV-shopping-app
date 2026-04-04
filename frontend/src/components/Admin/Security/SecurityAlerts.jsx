import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { resolveAlert } from "../../../redux/slices/securitySlice";
import { FaExclamationCircle, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

const SecurityAlerts = () => {
  const dispatch = useDispatch();
  const { alerts } = useSelector((state) => state.security);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "HIGH": return "bg-red-50 border-red-100 text-red-600";
      case "MEDIUM": return "bg-orange-50 border-orange-100 text-orange-600";
      default: return "bg-blue-50 border-blue-100 text-blue-600";
    }
  };

  const handleResolve = (id) => {
    dispatch(resolveAlert(id));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-50 flex items-center justify-between">
        <h2 className="text-xl font-bold text-black flex items-center gap-2">
          Security Alerts
          <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
            {alerts.filter(a => !a.isResolved).length} NEW
          </span>
        </h2>
      </div>

      <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto">
        {alerts.length > 0 ? (
          alerts.map((alert) => (
            <div
              key={alert._id}
              className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all duration-300 ${
                alert.isResolved ? "bg-gray-50 border-gray-100 opacity-60" : getSeverityColor(alert.severity)
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="mt-1">
                  {alert.severity === "HIGH" ? (
                    <FaExclamationCircle className="text-xl" />
                  ) : alert.severity === "MEDIUM" ? (
                    <FaExclamationTriangle className="text-xl" />
                  ) : (
                    <FaExclamationCircle className="text-xl" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest leading-none">
                      {alert.alertType}
                    </span>
                    <span className="text-[10px] font-medium opacity-60">
                      {new Date(alert.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm font-semibold mb-1">{alert.description}</p>
                  <p className="text-[10px] font-mono opacity-80">
                    Source: {alert.relatedIp || alert.relatedUser?.email || "Unknown"}
                  </p>
                </div>
              </div>

              {!alert.isResolved ? (
                <button
                  onClick={() => handleResolve(alert._id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all hover:translate-x-1 ${
                    alert.severity === "HIGH" 
                      ? "bg-red-600 text-white hover:bg-red-700" 
                      : "bg-black text-white hover:bg-neutral-800"
                  }`}
                >
                  <FaCheckCircle /> Resolve
                </button>
              ) : (
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400">
                  <FaCheckCircle /> RESOLVED BY {alert.resolvedBy?.name || "ADMIN"}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-400">
            <FaCheckCircle className="mx-auto text-3xl mb-4 opacity-10" />
            <p className="text-sm font-medium">System is secure. No active alerts.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SecurityAlerts;
