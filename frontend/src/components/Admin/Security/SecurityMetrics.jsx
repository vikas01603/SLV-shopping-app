import React from "react";
import { motion } from "framer-motion";
import { FaUserShield, FaUserTimes, FaUsers, FaExclamationTriangle, FaCreditCard } from "react-icons/fa";

const SecurityMetrics = ({ metrics }) => {
  const cards = [
    {
      title: "Logins Today",
      value: metrics?.totalLoginsToday || 0,
      icon: <FaUsers />,
      color: "bg-blue-50 text-blue-600",
      label: "Total Successful",
    },
    {
      title: "Failed Logins",
      value: metrics?.failedLoginsToday || 0,
      icon: <FaUserTimes />,
      color: "bg-orange-50 text-orange-600",
      label: "Potential Brute Force",
    },
    {
      title: "Active Users",
      value: metrics?.activeUsersLastHour || 0,
      icon: <FaUserShield />,
      color: "bg-emerald-50 text-emerald-600",
      label: "Last Hour",
    },
    {
      title: "Alerts",
      value: metrics?.unresolvedAlerts || 0,
      icon: <FaExclamationTriangle />,
      color: "bg-red-50 text-red-600",
      label: "Pending Review",
    },
    {
      title: "Payment Failures",
      value: metrics?.paymentFailuresToday || 0,
      icon: <FaCreditCard />,
      color: "bg-purple-50 text-purple-600",
      label: "Today",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {cards.map((card, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${card.color}`}>
              {card.icon}
            </div>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
              {card.label}
            </span>
          </div>
          <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">
            {card.title}
          </h3>
          <p className="text-2xl font-bold text-black">{card.value}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default SecurityMetrics;
