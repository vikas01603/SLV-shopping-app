import React, { useEffect, useState } from 'react';
import { HiOutlineBell, HiOutlineCheckCircle, HiOutlineSpeakerWave, HiOutlineTrash } from 'react-icons/hi2';
import { IoMdClose } from 'react-icons/io';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead, sendGlobalAnnouncement, deleteNotification } from '../redux/slices/notificationSlice';
import { toast } from 'sonner';

const NotificationsPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { notifications, status } = useSelector((state) => state.notifications);
    const { user } = useSelector((state) => state.auth);

    const [announcementModalOpen, setAnnouncementModalOpen] = useState(false);
    const [announcementTitle, setAnnouncementTitle] = useState("");
    const [announcementMessage, setAnnouncementMessage] = useState("");

    useEffect(() => {
        if (user) {
            dispatch(fetchNotifications());
        }
    }, [dispatch, user]);

    const markAsRead = (id) => {
        dispatch(markNotificationAsRead(id));
    };

    const markAllAsRead = () => {
        dispatch(markAllNotificationsAsRead());
    };

    const handleDelete = (id) => {
        dispatch(deleteNotification(id));
        toast.success("Notification deleted");
    };

    const handleSendAnnouncement = async (e) => {
        e.preventDefault();
        if (!announcementTitle || !announcementMessage) {
            toast.error("Please fill in both title and message");
            return;
        }

        try {
            await dispatch(sendGlobalAnnouncement({ title: announcementTitle, message: announcementMessage })).unwrap();
            toast.success("Announcement sent successfully!");
            setAnnouncementModalOpen(false);
            setAnnouncementTitle("");
            setAnnouncementMessage("");
            dispatch(fetchNotifications());
        } catch (error) {
            toast.error(error.message || "Failed to send announcement");
        }
    };

    const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

    return (
        <div className="container mx-auto py-8 px-4 max-w-4xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-2xl md:text-3xl font-semibold flex items-center gap-2">
                    <HiOutlineBell className="h-6 w-6 md:h-8 md:w-8" />
                    Notifications
                </h1>

                <div className="flex items-center gap-4">
                    {user && user.role === "admin" && (
                        <button
                            onClick={() => setAnnouncementModalOpen(true)}
                            className="bg-black text-white hover:bg-gray-800 px-3 py-2 rounded flex items-center gap-2 text-sm font-medium transition-colors"
                            title="Broadcast Announcement"
                        >
                            <HiOutlineSpeakerWave className='h-4 w-4 md:h-5 md:w-5' />
                            Post Notification
                        </button>
                    )}

                    {unreadCount > 0 && (
                        <button
                            onClick={markAllAsRead}
                            className="text-sm font-medium text-[#B89B5E] hover:text-[#9c814b] transition-colors"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white shadow-sm border rounded-lg overflow-hidden">
                {status === 'loading' ? (
                    <div className="p-8 text-center text-gray-500">Loading notifications...</div>
                ) : notifications && notifications.length > 0 ? (
                    <div className="divide-y divide-gray-200">
                        {notifications.map((notification) => (
                            <div
                                key={notification._id}
                                className={`p-4 md:p-6 flex justify-between items-start gap-4 transition-colors ${!notification.isRead ? 'bg-[#B89B5E]/5' : 'bg-white'}`}
                            >
                                <div
                                    className={`flex-1 ${notification.link ? 'cursor-pointer group' : ''}`}
                                    onClick={() => {
                                        if (notification.link) {
                                            if (!notification.isRead) markAsRead(notification._id);
                                            navigate(notification.link);
                                        }
                                    }}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        {!notification.isRead && (
                                            <span className="w-2 h-2 rounded-full bg-[#000000] inline-block"></span>
                                        )}
                                        <h3 className={`font-medium ${!notification.isRead ? 'text-[#2B2B2B]' : 'text-gray-500'} ${notification.link ? 'group-hover:text-[#B89B5E] transition-colors' : ''}`}>
                                            {notification.title}
                                        </h3>
                                    </div>
                                    <p className="text-sm text-gray-600 mb-2">
                                        {notification.message}
                                    </p>
                                    <span className="text-xs text-gray-400">
                                        {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>

                                {!notification.isRead ? (
                                    <button
                                        onClick={() => markAsRead(notification._id)}
                                        className="text-[#000000] hover:bg-gray-100 p-2 rounded-full transition-colors flex-shrink-0"
                                        title="Mark as read"
                                    >
                                        <HiOutlineCheckCircle className="h-6 w-6" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => handleDelete(notification._id)}
                                        className="text-red-500 hover:bg-red-50 p-2 rounded-full transition-colors flex-shrink-0"
                                        title="Delete notification"
                                    >
                                        <HiOutlineTrash className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center text-gray-500">
                        <HiOutlineBell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                        <p>No notifications yet</p>
                    </div>
                )}
            </div>

            {/** Admin Announcement Modal */}
            {announcementModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
                        <button
                            onClick={() => setAnnouncementModalOpen(false)}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                        >
                            <IoMdClose className="h-6 w-6" />
                        </button>
                        <h2 className="text-2xl font-semibold mb-4 text-[#2B2B2B] flex items-center gap-2">
                            <HiOutlineSpeakerWave className="text-[#B89B5E]" />
                            Global Announcement
                        </h2>
                        <form onSubmit={handleSendAnnouncement}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    value={announcementTitle}
                                    onChange={(e) => setAnnouncementTitle(e.target.value)}
                                    className="w-full border rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-[#B89B5E]"
                                    placeholder="e.g., Flash Sale Today!"
                                    required
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                                <textarea
                                    value={announcementMessage}
                                    onChange={(e) => setAnnouncementMessage(e.target.value)}
                                    className="w-full border rounded-md p-2 h-24 focus:outline-none focus:ring-1 focus:ring-[#B89B5E]"
                                    placeholder="Enter the notification content here..."
                                    required
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-black text-white py-2 rounded font-medium hover:bg-gray-800 transition-colors"
                            >
                                Send to All Users
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationsPage;
