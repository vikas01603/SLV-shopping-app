import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import imageCompression from 'browser-image-compression';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { HiPaperAirplane, HiOutlineUserCircle, HiOutlinePaperClip, HiOutlineChatBubbleLeftEllipsis, HiOutlinePhoto } from "react-icons/hi2";
import { HiOutlineEmojiHappy, HiDotsVertical, HiX, HiOutlineReply, HiOutlineSearch, HiOutlineDocumentDuplicate, HiOutlineTrash, HiArrowLeft } from "react-icons/hi";
import EmojiPicker from 'emoji-picker-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { HiCheckCircle, HiClock, HiEnvelopeOpen } from 'react-icons/hi2';

// Use environment variable for backend URL, fallback to window.location if deployed on same domain
const getBackendUrl = () => {
    let url = import.meta.env.VITE_BACKEND_URL || (window.location.protocol + "//" + window.location.hostname + (window.location.port ? ":" + window.location.port : ""));
    return url.endsWith('/') ? url.slice(0, -1) : url;
};
const SOCKET_URL = getBackendUrl();
const getFullUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${SOCKET_URL}${cleanPath}`;
};

const playPopSound = () => {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.1);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.1);
    } catch (e) { }
};

const AdminChat = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [socket, setSocket] = useState(null);
    const [typingStatus, setTypingStatus] = useState({});

    // Feature States
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const [editingMsg, setEditingMsg] = useState(null);
    const [attachment, setAttachment] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [showSearch, setShowSearch] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [previewModal, setPreviewModal] = useState(null);
    const [showHeaderMenu, setShowHeaderMenu] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeletingChat, setIsDeletingChat] = useState(false);
    const [toastMessage, setToastMessage] = useState(null);

    // Online tracking state map
    const [onlineUsers, setOnlineUsers] = useState({});
    const [lastSeenMap, setLastSeenMap] = useState({});

    const [showGallery, setShowGallery] = useState(false);
    const [isLoadingRooms, setIsLoadingRooms] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [roomSearch, setRoomSearch] = useState("");

    const chatContainerRef = useRef(null);
    const messagesEndRef = useRef(null);

    // Click outside handler for menus
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (activeMenu) setActiveMenu(null);
            if (showHeaderMenu) setShowHeaderMenu(false);
        };
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
    }, [activeMenu, showHeaderMenu]);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                setIsLoadingRooms(true);
                const config = { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } };
                const res = await axios.get(`${SOCKET_URL}/api/chat/all-rooms`, config);
                setRooms(res.data);
            } catch (err) {
                console.error("Error fetching rooms", err);
            } finally {
                setIsLoadingRooms(false);
            }
        };
        fetchRooms();
    }, []);

    useEffect(() => {
        if (!user || user.role !== 'admin') return;

        const newSocket = io(SOCKET_URL, {
            transports: ["polling", "websocket"],
            auth: { token: localStorage.getItem('userToken') }
        });
        setSocket(newSocket);

        // Let backend know we are online admin
        newSocket.emit('user_connect');

        newSocket.on('admin_room_update', (updatedRoom) => {
            setRooms((prevRooms) => {
                const exists = prevRooms.find(r => r._id === updatedRoom._id);
                if (exists) {
                    return prevRooms.map(r => r._id === updatedRoom._id ? updatedRoom : r).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
                }
                return [updatedRoom, ...prevRooms];
            });
        });

        return () => newSocket.close();
    }, [user]);

    useEffect(() => {
        if (!socket) return;

        socket.on('receive_message', (msg) => {
            if (msg.senderType === 'User') playPopSound();

            if (selectedRoom && msg.room === selectedRoom._id) {
                setMessages((prev) => [...prev, msg]);
                socket.emit('mark_read', { roomId: selectedRoom._id, readerType: 'Admin' });
            }
        });

        socket.on('display_typing', (data) => {
            if (data.senderType === 'User') {
                setTypingStatus((prev) => ({ ...prev, [data.roomId]: data.isTyping }));
            }
        });

        socket.on('messages_seen', (data) => {
            if (data.readerType === 'User' && selectedRoom) {
                setMessages(prev => prev.map(m => m.status !== 'Seen' && m.senderType === 'Admin' ? { ...m, status: 'Seen' } : m));
            }
        });

        socket.on('message_edited', (editedMsg) => {
            setMessages(prev => prev.map(m => m._id === editedMsg._id ? editedMsg : m));
        });

        socket.on('message_deleted', (deletedMsg) => {
            setMessages(prev => prev.map(m => m._id === deletedMsg._id ? deletedMsg : m));
        });

        socket.on('conversation_deleted', (data) => {
            setRooms((prevRooms) => prevRooms.filter(r => r._id !== data.roomId));
            setSelectedRoom((prevSelected) => {
                if (prevSelected && prevSelected._id === data.roomId) {
                    return null;
                }
                return prevSelected;
            });
        });

        socket.on('message_status_update', (data) => {
            setMessages(prev => prev.map(m => m._id === data.messageId ? { ...m, status: data.status } : m));
        });

        socket.on('room_status_updated', (data) => {
            if (selectedRoom && selectedRoom._id === data.roomId) {
                setSelectedRoom(prev => ({ ...prev, chatStatus: data.status }));
            }
            // Rooms list will be updated by admin_room_update event
        });

        socket.on('message_sent', (msg) => {
            if (selectedRoom && msg.room === selectedRoom._id) {
                setMessages(prev => {
                    const exists = prev.find(m => m._id === msg._id);
                    if (exists) return prev;
                    return [...prev, msg];
                });
            }
        });

        socket.on('message_reaction', (data) => {
            setMessages(prev => prev.map(m => m._id === data.messageId ? { ...m, reactions: data.reactions } : m));
        });

        socket.on('user_status_change', ({ userId, isOnline }) => {
            setOnlineUsers(prev => ({ ...prev, [userId]: isOnline }));
        });

        return () => {
            socket.off('receive_message');
            socket.off('display_typing');
            socket.off('messages_seen');
            socket.off('message_edited');
            socket.off('message_deleted');
            socket.off('conversation_deleted');
            socket.off('message_reaction');
            socket.off('user_status_change');
            socket.off('room_status_updated');
        };
    }, [socket, selectedRoom]);

    useEffect(() => {
        const fetchMessages = async () => {
            if (!selectedRoom) return;
            try {
                setIsLoadingMessages(true);
                const config = { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } };
                const res = await axios.get(`${SOCKET_URL}/api/chat/${selectedRoom._id}/messages?page=1&limit=30`, config);

                setMessages(res.data.messages || []);
                setPage(res.data.page);
                setHasMore(res.data.page < res.data.pages);

                if (socket) {
                    socket.emit('join_room', selectedRoom._id);
                    socket.emit('mark_read', { roomId: selectedRoom._id, readerType: 'Admin' });
                }

                setRooms(prev => prev.map(r => r._id === selectedRoom._id ? { ...r, unreadCountAdmin: 0 } : r));

                setActiveMenu(null);
                setReplyingTo(null);
                setEditingMsg(null);
                setAttachment(null);
                setNewMessage("");
            } catch (err) {
                console.error("Error fetching messages", err);
            } finally {
                setIsLoadingMessages(false);
            }
        };
        fetchMessages();
    }, [selectedRoom, socket]);

    const handleScroll = async (e) => {
        if (e.target.scrollTop === 0 && hasMore && selectedRoom) {
            try {
                const config = { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } };
                const res = await axios.get(`${SOCKET_URL}/api/chat/${selectedRoom._id}/messages?page=${page + 1}&limit=30`, config);

                setMessages(prev => [...res.data.messages, ...prev]);
                setPage(res.data.page);
                setHasMore(res.data.page < res.data.pages);
            } catch (err) { }
        }
    };

    useEffect(() => {
        if (!editingMsg && messages[messages.length - 1]?.senderType === 'Admin' && !searchTerm) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, searchTerm]);

    useEffect(() => {
        if (selectedRoom && socket) {
            messagesEndRef.current?.scrollIntoView();
        }
    }, [selectedRoom, socket]);

    const handleFileUpload = async (e, droppedFile = null) => {
        const file = droppedFile || e.target?.files[0];
        if (!file) return;

        let processedFile = file;

        if (file.type.startsWith('image/')) {
            const options = {
                maxSizeMB: 1,
                maxWidthOrHeight: 1280,
                useWebWorker: true,
            };
            try {
                processedFile = await imageCompression(file, options);
            } catch (error) {
                console.error("Image compression error", error);
            }
        }

        const formData = new FormData();
        formData.append("file", processedFile, file.name);

        try {
            setUploading(true);
            setUploadProgress(0);
            const config = {
                headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${localStorage.getItem('userToken')}` },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            };
            const { data } = await axios.post(`${SOCKET_URL}/api/chat/upload`, formData, config);

            setAttachment({
                url: data.fileUrl,
                type: data.fileType,
                name: data.fileName,
                size: data.fileSize,
                mimeType: data.mimeType,
                preview: file.type.startsWith('image/') ? URL.createObjectURL(processedFile) : null
            });
            setUploading(false);
            setUploadProgress(0);
        } catch (err) {
            console.error("Upload failed", err);
            setUploading(false);
            setUploadProgress(0);
        }
    };

    // Drag and Drop handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileUpload(null, e.dataTransfer.files[0]);
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!socket || !selectedRoom) return;
        if (!newMessage.trim() && !attachment) return;

        if (editingMsg) {
            socket.emit('edit_message', { messageId: editingMsg._id, newText: newMessage, roomId: selectedRoom._id });
            setEditingMsg(null);
            setNewMessage("");
            return;
        }

        const msgData = {
            roomId: selectedRoom._id,
            sender: user._id,
            senderType: 'Admin',
            message: newMessage,
            messageType: attachment ? attachment.type : 'text',
            ...(attachment?.url && { fileUrl: attachment.url }),
            ...(attachment?.name && { fileName: attachment.name }),
            ...(attachment?.size && { fileSize: attachment.size }),
            ...(attachment?.mimeType && { mimeType: attachment.mimeType }),
            ...(replyingTo && { replyTo: replyingTo._id })
        };

        socket.emit('send_message', msgData);
        setNewMessage("");
        setAttachment(null);
        setReplyingTo(null);
        setShowEmojiPicker(false);
        socket.emit('typing_stop', { roomId: selectedRoom._id, senderType: 'Admin' });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        if (socket && selectedRoom) {
            socket.emit('typing_start', { roomId: selectedRoom._id, senderType: 'Admin' });

            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                socket.emit('typing_stop', { roomId: selectedRoom._id, senderType: 'Admin' });
            }, 2000);
        }
    };

    const typingTimeoutRef = useRef(null);

    const updateChatStatus = async (status) => {
        if (!socket || !selectedRoom) return;
        try {
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } };
            await axios.put(`${SOCKET_URL}/api/chat/${selectedRoom._id}/status`, { status }, config);

            socket.emit('update_room_status', { roomId: selectedRoom._id, status });

            setSelectedRoom(prev => ({ ...prev, chatStatus: status }));
            setRooms(prev => prev.map(r => r._id === selectedRoom._id ? { ...r, chatStatus: status } : r));
        } catch (err) {
            console.error("Failed to update status", err);
        }
    };

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchTerm(query);
        if (query.length > 2) {
            try {
                const config = { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } };
                const res = await axios.get(`${SOCKET_URL}/api/chat/search?query=${query}`, config);
                if (selectedRoom) {
                    const results = res.data.filter(m => (m.room._id || m.room) === selectedRoom._id);
                    setMessages(prev => {
                        const existingIds = new Set(prev.map(m => m._id));
                        const newMsgs = results.filter(m => !existingIds.has(m._id));
                        return [...prev, ...newMsgs].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                    });
                }
            } catch (err) {
                console.error("Search failed", err);
            }
        }
    };

    const startEdit = (msg) => {
        setEditingMsg(msg);
        setNewMessage(msg.message);
        setActiveMenu(null);
    };

    const deleteMsg = (msgId, forEveryone = true) => {
        if (socket && selectedRoom) {
            socket.emit('delete_message', { messageId: msgId, roomId: selectedRoom._id, deleteForEveryone: forEveryone, deletedBy: 'Admin' });
        }
        setActiveMenu(null);
    };

    const toggleReaction = (msgId, emojiStr) => {
        if (socket && selectedRoom) {
            socket.emit('reaction_added', { messageId: msgId, roomId: selectedRoom._id, emoji: emojiStr, userId: user._id });
        }
        setActiveMenu(null);
    };

    const handleDeleteConversation = async () => {
        if (!selectedRoom) return;
        try {
            setIsDeletingChat(true);
            const config = { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } };
            await axios.delete(`${SOCKET_URL}/api/chat/conversation/${selectedRoom._id}`, config);

            socket.emit('delete_conversation', { roomId: selectedRoom._id });

            setToastMessage("Conversation deleted successfully");
            setTimeout(() => setToastMessage(null), 3000);

            setShowDeleteModal(false);
            setIsDeletingChat(false);
            setShowHeaderMenu(false);
        } catch (error) {
            console.error("Delete conversation error:", error);
            setIsDeletingChat(false);
            setToastMessage("Failed to delete conversation");
            setTimeout(() => setToastMessage(null), 3000);
        }
    };

    const copyText = (text) => {
        navigator.clipboard.writeText(text);
        setActiveMenu(null);
    };

    const filteredMessages = messages
        .filter(m => !(m.isDeleted && !m.deletedForEveryone && m.deletedBy === 'Admin'));

    return (
        <div className="flex h-[calc(100vh-100px)] min-h-[500px] bg-white rounded-2xl shadow-lg shadow-black/5 border border-gray-100 overflow-hidden font-sans relative">
            <div className={`w-full md:w-[320px] md:min-w-[320px] border-r border-gray-100 bg-gray-50 flex-col z-10 shadow-[2px_0_15px_rgba(0,0,0,0.02)] ${selectedRoom ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-5 border-b border-gray-100 bg-white">
                    <div className="flex items-center gap-2 mb-3">
                        <button onClick={() => navigate('/admin')} className="md:hidden p-1.5 -ml-1.5 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-all">
                            <HiArrowLeft className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-bold tracking-tight text-gray-900">Support Chats</h2>
                    </div>
                    <div className="relative">
                        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Find a customer..."
                            value={roomSearch}
                            onChange={(e) => setRoomSearch(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-black/5 outline-none transition-all placeholder:text-gray-400"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-50/50">
                    {isLoadingRooms ? (
                        <div className="p-4 space-y-4">
                            {[1, 2, 3, 4].map(n => <div key={n} className="h-16 bg-gray-200 animate-pulse rounded-xl" />)}
                        </div>
                    ) : rooms.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 p-6 text-center">
                            <HiOutlineChatBubbleLeftEllipsis className="w-12 h-12 mb-3 opacity-20" />
                            <p className="font-medium text-gray-500">No active chats.</p>
                            <p className="text-xs mt-1">Incoming conversations will appear here.</p>
                        </div>
                    ) : (rooms.filter(r => r.user?.name?.toLowerCase().includes(roomSearch.toLowerCase())).map(room => {
                        const isUserOnline = onlineUsers[room.user?._id];

                        return (
                            <div
                                key={room._id}
                                onClick={() => setSelectedRoom(room)}
                                className={`p-4 border-b border-gray-100/50 cursor-pointer transition-all flex items-center justify-between group
                                ${selectedRoom?._id === room._id ? 'bg-gradient-to-r from-gray-900 to-black text-white shadow-md transform scale-[1.01]'
                                        : 'hover:bg-white hover:shadow-sm'}`}
                            >
                                <div className="flex items-center gap-3 overflow-hidden w-full">
                                    <div className="relative">
                                        <HiOutlineUserCircle className={`w-[42px] h-[42px] transition-colors ${selectedRoom?._id === room._id ? 'text-gray-300' : 'text-gray-400 group-hover:text-black'}`} />
                                        <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 ${selectedRoom?._id === room._id ? 'border-gray-800' : 'border-white'} ${isUserOnline ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                    </div>

                                    <div className="overflow-hidden flex flex-col justify-center flex-1 pr-2">
                                        <div className="flex items-center justify-between">
                                            <h4 className={`font-semibold text-sm truncate transition-colors ${selectedRoom?._id === room._id ? 'text-white' : 'text-gray-900'}`}>{room.user?.name || "Unknown User"}</h4>
                                            <AnimatePresence mode="wait">
                                                <motion.span
                                                    key={room.chatStatus}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase ${room.chatStatus === 'Resolved' ? 'bg-green-500/20 text-green-500' : room.chatStatus === 'Pending' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-blue-500/20 text-blue-500'}`}>
                                                    {room.chatStatus || 'Open'}
                                                </motion.span>
                                            </AnimatePresence>
                                        </div>
                                        <p className={`text-[12px] truncate transition-colors max-w-full ${selectedRoom?._id === room._id ? 'text-gray-400' : 'text-gray-500'}`}>
                                            {room.lastMessage || "Started a chat"}
                                        </p>
                                        {!isUserOnline && room.user?.lastSeen && (
                                            <span className={`text-[9px] font-medium ${selectedRoom?._id === room._id ? 'text-gray-500' : 'text-gray-400'}`}>
                                                Seen {new Date(room.user.lastSeen).toLocaleDateString() === new Date().toLocaleDateString() ? new Date(room.user.lastSeen).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'yesterday'}
                                            </span>
                                        )}
                                        {!isUserOnline && !room.user?.lastSeen && (
                                            <span className={`text-[9px] font-medium ${selectedRoom?._id === room._id ? 'text-gray-500' : 'text-gray-400'}`}>
                                                Offline
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end justify-between h-full py-1">
                                    <span className={`text-[10px] whitespace-nowrap font-medium ${selectedRoom?._id === room._id ? 'text-gray-400' : 'text-gray-400'}`}>
                                        {new Date(room.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {room.unreadCountAdmin > 0 && selectedRoom?._id !== room._id ? (
                                        <span className="bg-red-500 text-white text-[10px] font-bold min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full mt-1.5 shadow-sm ring-2 ring-red-500/20 animate-pulse">
                                            {room.unreadCountAdmin}
                                        </span>
                                    ) : <div className="h-5"></div>}
                                </div>
                            </div>
                        )
                    }))}
                </div>
            </div>

            <div className={`flex-1 flex-col bg-white relative ${selectedRoom ? 'flex' : 'hidden md:flex'}`}>
                {selectedRoom ? (
                    <>
                        <div className="p-4 border-b border-gray-100 shadow-sm z-20 bg-white flex flex-col relative w-full">
                            <div className="flex justify-between items-center w-full">
                                <div className="flex items-center justify-between w-full">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-10 h-10 bg-gray-100 flex items-center justify-center rounded-full">
                                                <HiOutlineUserCircle className="w-6 h-6 text-gray-500" />
                                            </div>
                                            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${onlineUsers[selectedRoom.user?._id] ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[15px] text-gray-900">{selectedRoom.user?.name}</h3>
                                            <p className="text-[12px] text-gray-500">{selectedRoom.user?.email} • {onlineUsers[selectedRoom.user?._id] ? 'Online' : 'Offline'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 relative">
                                        <button onClick={() => setShowGallery(!showGallery)} className="w-10 h-10 bg-gray-50 text-gray-400 hover:text-black flex items-center justify-center rounded-full transition-all" title="View Gallery">
                                            <HiOutlinePhoto className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => setShowSearch(!showSearch)} className="w-10 h-10 bg-gray-50 text-gray-400 hover:text-black flex items-center justify-center rounded-full transition-all">
                                            <HiOutlineSearch className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setShowHeaderMenu(!showHeaderMenu); }}
                                            className={`w-10 h-10 flex items-center justify-center rounded-full transition-all ${showHeaderMenu ? 'bg-black text-white' : 'bg-gray-50 text-gray-400 hover:text-black'}`}
                                        >
                                            <HiDotsVertical className="w-5 h-5" />
                                        </button>
                                        <AnimatePresence>
                                            {showHeaderMenu && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                    className="absolute right-0 top-12 bg-white shadow-2xl border border-gray-100 rounded-2xl w-56 py-2 z-[9999] pointer-events-auto"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <div className="px-4 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1">Update Status</div>
                                                    <button onClick={() => { updateChatStatus('Open'); setShowHeaderMenu(false); }} className="w-full text-left px-5 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors">Mark as Open</button>
                                                    <button onClick={() => { updateChatStatus('Pending'); setShowHeaderMenu(false); }} className="w-full text-left px-5 py-2 text-sm text-yellow-600 hover:bg-yellow-50 transition-colors">Mark as Pending</button>
                                                    <button onClick={() => { updateChatStatus('Resolved'); setShowHeaderMenu(false); }} className="w-full text-left px-5 py-2 text-sm text-green-600 hover:bg-green-50 transition-colors">Mark as Resolved</button>
                                                    <div className="my-2 border-t border-gray-50"></div>
                                                    <a href={`${SOCKET_URL}/api/chat/${selectedRoom._id}/export`} className="w-full text-left px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors font-medium">Export Chat Logic</a>
                                                    <button onClick={() => { setShowHeaderMenu(false); setShowDeleteModal(true); }} className="w-full text-left px-5 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors font-medium">
                                                        <HiOutlineTrash className="w-4 h-4" /> Delete Conversation
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>

                            <AnimatePresence>
                                {showSearch && (
                                    <motion.div initial={{ height: 0, opacity: 0, marginTop: 0 }} animate={{ height: 'auto', opacity: 1, marginTop: 12 }} exit={{ height: 0, opacity: 0, marginTop: 0 }} className="w-full">
                                        <input type="text" placeholder="Search customer's messages..." value={searchTerm} onChange={handleSearch} className="w-full bg-gray-50 border border-gray-200 rounded-lg text-[13px] px-4 py-2 focus:ring-1 focus:ring-black outline-none transition-all" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div
                            className={`flex-1 p-6 overflow-y-auto bg-gray-50/50 flex flex-col gap-6 relative custom-scrollbar w-full ${isDragging ? 'bg-blue-50/50 border-2 border-dashed border-blue-400' : ''}`}
                            ref={chatContainerRef}
                            onScroll={handleScroll}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                        >
                            {isDragging && (
                                <div className="absolute inset-0 z-10 bg-white/50 backdrop-blur-sm flex items-center justify-center pointer-events-none rounded-xl">
                                    <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center">
                                        <HiOutlinePaperClip className="w-12 h-12 text-blue-500 mb-2" />
                                        <h3 className="font-semibold text-gray-800">Drop files to send</h3>
                                    </div>
                                </div>
                            )}
                            {!hasMore && filteredMessages.length > 0 && !searchTerm && <p className="text-center text-xs text-gray-400 my-2">-- Start of conversation --</p>}

                            {isLoadingMessages ? (
                                <div className="flex flex-col gap-4">
                                    {[1, 2, 3, 4].map(n => (
                                        <div key={n} className={`flex ${n % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                                            <div className="w-1/2 h-14 bg-gray-200 animate-pulse rounded-2xl" />
                                        </div>
                                    ))}
                                </div>
                            ) : filteredMessages.length === 0 && !searchTerm ? (
                                <div className="m-auto text-center text-gray-400 flex flex-col items-center">
                                    <HiOutlineChatBubbleLeftEllipsis className="w-12 h-12 mb-3 opacity-20" />
                                    <p className="font-medium text-gray-500">Pick a customer to start chatting</p>
                                </div>
                            ) : filteredMessages.length === 0 && searchTerm ? (
                                <div className="m-auto text-center text-gray-400 flex flex-col items-center">
                                    <HiOutlineSearch className="w-10 h-10 mb-2 opacity-50" />
                                    <p className="font-medium text-gray-800">No matches found</p>
                                </div>
                            ) : null}

                            {filteredMessages.map((msg, index) => {
                                const isMe = msg.senderType === 'Admin';
                                const isDeleted = msg.isDeleted;
                                const showAvatar = !isMe && (index === 0 || filteredMessages[index - 1].senderType === 'Admin');

                                const msgDate = new Date(msg.createdAt).toLocaleDateString();
                                const prevDate = index > 0 ? new Date(filteredMessages[index - 1].createdAt).toLocaleDateString() : null;
                                const showDateHeader = msgDate !== prevDate && !searchTerm;

                                const getFriendlyDate = (dateStr) => {
                                    const date = new Date(dateStr);
                                    const today = new Date();
                                    const yesterday = new Date();
                                    yesterday.setDate(today.getDate() - 1);

                                    if (date.toLocaleDateString() === today.toLocaleDateString()) return 'Today';
                                    if (date.toLocaleDateString() === yesterday.toLocaleDateString()) return 'Yesterday';
                                    return date.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
                                };

                                return (
                                    <React.Fragment key={msg._id || index}>
                                        {showDateHeader && (
                                            <div className="flex justify-center my-6 w-full">
                                                <span className="text-[10px] bg-white text-gray-400 px-4 py-1.5 rounded-full font-bold shadow-sm border border-gray-100 uppercase tracking-widest leading-none">
                                                    {getFriendlyDate(msg.createdAt)}
                                                </span>
                                            </div>
                                        )}

                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.15 }}
                                            className={`relative flex ${isMe ? 'justify-end' : 'justify-start'} group w-full px-2 lg:px-6`}
                                        >
                                            {!isMe && (
                                                <div className="w-8 flex-shrink-0 mr-2 flex flex-col justify-end">
                                                    {showAvatar && (
                                                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mb-1 flex-shrink-0">
                                                            <HiOutlineUserCircle className="w-5 h-5 text-gray-500" />
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                                                {msg.replyTo && !isDeleted && (
                                                    <div
                                                        onClick={() => {
                                                            const el = document.getElementById(`msg-${msg.replyTo._id}`);
                                                            el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                        }}
                                                        className={`text-[12px] p-2 mb-1.5 rounded-md opacity-90 border-l-2 truncate w-full cursor-pointer hover:bg-opacity-100 transition-all ${isMe ? 'bg-gray-200 border-black text-black' : 'bg-gray-200 border-gray-400 text-gray-700'}`}>
                                                        <span className="font-semibold block">{msg.replyTo.senderType === 'User' ? 'Customer' : 'You'}</span>
                                                        {msg.replyTo.message || "Attachment"}
                                                    </div>
                                                )}

                                                <div
                                                    id={`msg-${msg._id}`}
                                                    className={`relative px-4 py-2.5 shadow-sm 
                                                ${isDeleted ? 'bg-white text-gray-400 italic border border-gray-200 rounded-2xl'
                                                            : isMe ? 'bg-black text-white rounded-2xl rounded-br-sm' : 'bg-white border text-gray-800 border-gray-200 rounded-2xl rounded-bl-sm'}
                                                `}>
                                                    {!isDeleted && (
                                                        <>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); setActiveMenu(activeMenu === msg._id ? null : msg._id); }}
                                                                className={`absolute top-0 w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 text-gray-400 hover:text-black transition-all bg-white rounded-full shadow-sm border border-gray-100 z-20 ${isMe ? 'right-full mr-2' : 'left-full ml-2'}`}
                                                            >
                                                                <HiDotsVertical className="w-4 h-4" />
                                                            </button>

                                                            <AnimatePresence>
                                                                {activeMenu === msg._id && !isDeleted && (
                                                                    <motion.div
                                                                        initial={{ opacity: 0, scale: 0.95, x: isMe ? -10 : 10 }}
                                                                        animate={{ opacity: 1, scale: 1, x: 0 }}
                                                                        exit={{ opacity: 0, scale: 0.95, x: isMe ? -10 : 10 }}
                                                                        className={`absolute top-0 z-[9999] bg-white shadow-2xl border border-gray-100 rounded-xl w-48 text-[13px] overflow-hidden flex flex-col py-1.5 ${isMe ? 'right-full mr-12' : 'left-full ml-12'}`}
                                                                        onClick={(e) => e.stopPropagation()}
                                                                    >
                                                                        <button onClick={() => { setReplyingTo(msg); setActiveMenu(null); }} className="px-5 py-2.5 text-left hover:bg-gray-50 text-gray-700 flex items-center gap-2 font-medium transition-colors"><HiOutlineReply className="w-4 h-4" /> Reply</button>
                                                                        <div className="px-5 py-2.5 flex justify-between bg-gray-50/50 border-y border-gray-100 my-0.5">
                                                                            {['👍', '❤️', '😂', '😮', '😢'].map(em => (
                                                                                <span key={em} className="cursor-pointer hover:scale-125 transition-transform text-lg" onClick={() => toggleReaction(msg._id, em)}>{em}</span>
                                                                            ))}
                                                                        </div>
                                                                        {msg.message && <button onClick={() => { copyText(msg.message); setActiveMenu(null); }} className="px-5 py-3 text-left hover:bg-gray-50 text-gray-700 flex items-center gap-2 font-medium transition-colors"><HiOutlineDocumentDuplicate className="w-4 h-4" /> Copy Text</button>}
                                                                        {isMe && <button onClick={() => startEdit(msg)} className="px-5 py-2.5 text-left hover:bg-gray-50 text-gray-700 flex items-center gap-2 font-medium transition-colors">Edit Message</button>}
                                                                        {isMe && <button onClick={() => deleteMsg(msg._id, false)} className="px-5 py-2.5 text-left hover:bg-red-50 text-red-600 flex items-center gap-2 font-medium transition-colors mt-1 border-t border-gray-100 pt-3"><HiOutlineTrash className="w-4 h-4" /> Delete for me</button>}
                                                                        {isMe && <button onClick={() => deleteMsg(msg._id, true)} className="px-5 py-2.5 text-left hover:bg-red-50 text-red-600 flex items-center gap-2 font-medium transition-colors pb-3"><HiOutlineTrash className="w-4 h-4" /> Delete for everyone</button>}
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>
                                                        </>
                                                    )}

                                                    {!isDeleted && msg.fileUrl && (
                                                        <div className={`mb-2 ${msg.message ? 'border-b border-gray-200/20 pb-2.5' : ''}`}>
                                                            {msg.messageType === 'voice' ? (
                                                                <div className="flex items-center gap-2 min-w-[200px] py-1">
                                                                    <audio controls className="h-10 w-full" src={`${SOCKET_URL}${msg.fileUrl}`} />
                                                                </div>
                                                            ) : msg.messageType === 'image' ? (
                                                                <div onClick={() => setPreviewModal(msg.fileUrl)} className="cursor-pointer overflow-hidden rounded-xl bg-white border border-gray-100 flex items-center justify-center">
                                                                    <img src={getFullUrl(msg.fileUrl)} alt="Attachment" className="max-w-full max-h-56 object-cover hover:scale-105 transition-transform duration-300" />
                                                                </div>
                                                            ) : (
                                                                <div className={`flex items-center justify-between gap-3 p-2.5 rounded-xl ${isMe ? 'bg-gray-800/80 border border-gray-700' : 'bg-gray-100 border border-gray-200'} transition-colors mt-1`}>
                                                                    <div className="flex items-center gap-2 overflow-hidden">
                                                                        <div className={`p-2 rounded-lg ${isMe ? 'bg-gray-700' : 'bg-white shadow-sm'}`}>
                                                                            <HiOutlinePaperClip className="w-5 h-5 shrink-0" />
                                                                        </div>
                                                                        <div className="flex flex-col truncate">
                                                                            <span className="text-[13px] font-semibold truncate leading-tight">{msg.fileName || "Document"}</span>
                                                                            <span className={`text-[11px] ${isMe ? 'text-gray-400' : 'text-gray-500'}`}>{msg.fileSize ? (msg.fileSize / 1024 / 1024).toFixed(2) + ' MB' : msg.mimeType?.split('/')[1] || 'File'}</span>
                                                                        </div>
                                                                    </div>
                                                                    <a href={SOCKET_URL + msg.fileUrl} download={msg.fileName} target="_blank" rel="noopener noreferrer" className={`p-2 rounded-full ${isMe ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'} transition-colors shrink-0`}>
                                                                        <HiOutlineDocumentDuplicate className="w-4 h-4" />
                                                                    </a>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}

                                                    <p className="text-[15px] leading-relaxed whitespace-pre-wrap tracking-wide">
                                                        {searchTerm && msg.message ? (
                                                            msg.message.split(new RegExp(`(${searchTerm})`, 'gi')).map((part, i) =>
                                                                part.toLowerCase() === searchTerm.toLowerCase() ? <mark key={i} className="bg-yellow-300 text-black px-0.5 rounded">{part}</mark> : part
                                                            )
                                                        ) : msg.message}
                                                    </p>

                                                    {msg.reactions && msg.reactions.length > 0 && !isDeleted && (
                                                        <div className={`absolute -bottom-3 ${isMe ? 'right-2' : 'left-2'} bg-white border border-gray-200 shadow-sm rounded-full px-2 py-0.5 text-[12px] flex gap-1 z-10 items-center`}>
                                                            {Array.from(new Set(msg.reactions.map(r => r.emoji))).map(emoji => (
                                                                <span key={emoji} className="cursor-pointer hover:scale-110 transition-transform flex items-center gap-1 text-gray-700" onClick={() => toggleReaction(msg._id, emoji)}>
                                                                    {emoji} <span className="text-[10px] font-medium text-gray-500">{msg.reactions.filter(r => r.emoji === emoji).length}</span>
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className={`text-[11px] mt-1.5 flex items-center gap-1.5 w-full ${isMe ? 'justify-end text-gray-400' : 'justify-start text-gray-400 px-1'}`}>
                                                    {msg.isEdited && !isDeleted && <span className="italic mr-0.5">(edited)</span>}
                                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    {isMe && !isDeleted && (
                                                        <span className="font-bold tracking-tighter text-[12px] ml-1">
                                                            {msg.status === 'Sent' ? (
                                                                <span title="Sent">✓</span>
                                                            ) : msg.status === 'Delivered' ? (
                                                                <span title="Delivered">✓✓</span>
                                                            ) : (
                                                                <span className="text-blue-500" title="Seen by Customer">✓✓</span>
                                                            )}
                                                        </span>
                                                    )}
                                                </div>


                                            </div>
                                        </motion.div>
                                    </React.Fragment>
                                )
                            })}

                            {typingStatus[selectedRoom._id] && (
                                <div className="flex justify-start w-full relative px-2 lg:px-6">
                                    <div className="w-8 flex-shrink-0 mr-2 flex flex-col justify-end">
                                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mb-1">
                                            <HiOutlineUserCircle className="w-5 h-5 text-gray-500" />
                                        </div>
                                    </div>
                                    <div className="bg-white border border-gray-200 text-gray-400 rounded-2xl px-5 py-3 shadow-sm rounded-bl-sm flex items-center gap-1.5 self-start h-[42px]">
                                        <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                                        <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                                        <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                                    </div>
                                </div>
                            )}

                            <div ref={messagesEndRef} className="h-4" />
                        </div>

                        <div className="bg-white border-t border-gray-100 z-10 px-6 relative">
                            <AnimatePresence>
                                {showEmojiPicker && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute bottom-full right-6 mb-2 shadow-2xl z-50 rounded-xl overflow-hidden border border-gray-100"
                                    >
                                        <EmojiPicker onEmojiClick={(e) => { setNewMessage(prev => prev + e.emoji); setShowEmojiPicker(false); }} />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {replyingTo && (
                                <div className="bg-gray-50 p-3 text-sm flex justify-between items-center rounded-t-xl mt-3 border-l-[3px] border-black">
                                    <div className="truncate pr-4 text-gray-700 max-w-[500px]">
                                        <span className="font-semibold text-black mr-2">Replying to:</span>
                                        {replyingTo.message || "Attachment"}
                                    </div>
                                    <button onClick={() => setReplyingTo(null)} className="text-gray-400 hover:text-black hover:bg-gray-200 p-1 rounded-md transition-colors"><HiX /></button>
                                </div>
                            )}
                            {attachment && (
                                <div className="bg-white p-3 text-sm flex justify-between items-center rounded-xl mt-3 border border-gray-200 shadow-sm relative overflow-hidden group">
                                    <div className="flex items-center gap-3 w-[85%]">
                                        {attachment.preview ? (
                                            <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-gray-100 shadow-sm bg-gray-50">
                                                <img src={attachment.preview} alt="preview" className="w-full h-full object-cover" />
                                            </div>
                                        ) : (
                                            <div className="w-10 h-10 rounded-lg shrink-0 border border-gray-100 shadow-sm bg-blue-50 text-blue-500 flex items-center justify-center">
                                                <HiOutlinePaperClip className="w-5 h-5" />
                                            </div>
                                        )}
                                        <div className="flex flex-col truncate w-full">
                                            <span className="truncate font-medium text-gray-800 text-[13px] leading-tight">{attachment.name}</span>
                                            {attachment.size && <span className="text-[10px] text-gray-500 font-medium">{(attachment.size / 1024 / 1024).toFixed(2)} MB • {attachment.type.toUpperCase()}</span>}
                                        </div>
                                    </div>
                                    <button onClick={() => setAttachment(null)} className="text-gray-400 hover:text-red-500 p-1.5 hover:bg-red-50 rounded-full transition-colors shrink-0 bg-gray-50 absolute right-2 opacity-100 group-hover:bg-red-50"><HiX className="w-4 h-4" /></button>
                                </div>
                            )}

                            {editingMsg && (
                                <div className="bg-yellow-50/50 p-3 text-sm flex justify-between items-center rounded-t-xl mt-3 border-l-[3px] border-yellow-400">
                                    <span className="text-yellow-800 font-medium">Editing message...</span>
                                    <button onClick={() => { setEditingMsg(null); setNewMessage(""); }} className="text-gray-400 hover:text-black hover:bg-yellow-100 p-1 rounded-md transition-colors"><HiX /></button>
                                </div>
                            )}
                        </div>

                        <div className="p-3 sm:p-4 bg-white flex flex-col pb-4 sm:pb-5 px-3 sm:px-6 z-10 relative border-t sm:border-t-0 border-gray-100">
                            <form onSubmit={handleSendMessage} className="flex gap-2 sm:gap-2.5 items-end">

                                <label className={`p-3 sm:p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 hover:text-black hover:bg-gray-100 transition-all cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <HiOutlinePaperClip className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px]" />
                                    <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                                </label>

                                <textarea
                                    value={newMessage}
                                    onChange={handleTyping}
                                    onKeyDown={handleKeyDown}
                                    disabled={uploading}
                                    placeholder={uploading ? `Uploading ${uploadProgress}%...` : "Message..."}
                                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 sm:px-5 py-2.5 sm:py-3.5 min-h-[46px] sm:min-h-[52px] max-h-32 sm:max-h-36 h-[46px] sm:h-[52px] resize-none focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-black/20 focus:bg-white transition-all custom-scrollbar flex items-center self-center text-[13px] sm:text-[14px]"
                                />

                                <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="hidden sm:block p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 hover:text-black hover:bg-gray-100 transition-all">
                                    <HiOutlineEmojiHappy className="w-[22px] h-[22px]" />
                                </button>

                                <button
                                    type="submit"
                                    disabled={(!newMessage.trim() && !attachment) || uploading}
                                    className="group bg-black text-white px-4 sm:px-7 py-2.5 sm:py-3 min-h-[46px] sm:min-h-[52px] h-[46px] sm:h-[52px] rounded-xl font-medium hover:bg-gray-800 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0 active:scale-95 text-[14px] sm:text-[15px]"
                                >
                                    <span className="hidden sm:inline">Send</span> <HiPaperAirplane className="w-4 h-4 sm:w-5 sm:h-5 sm:ml-2.5 -rotate-45 sm:group-hover:translate-x-1 sm:group-hover:-translate-y-1 transition-transform" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-gray-50/50">
                        <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 4, repeat: Infinity }}>
                            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-200">
                                <HiOutlineUserCircle className="w-12 h-12 text-gray-400" />
                            </div>
                        </motion.div>
                        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Select a conversation</h3>
                        <p className="text-sm text-gray-500 mt-2 max-w-sm text-center leading-relaxed">Choose a chat from the left sidebar to start responding to customer inquiries in real-time.</p>
                    </div>
                )}
            </div>

            {/* PREVIEW MODAL */}
            <AnimatePresence>
                {previewModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10000] bg-black/90 flex flex-col items-center justify-center backdrop-blur-sm" onClick={() => setPreviewModal(null)}>
                        <button className="absolute top-6 right-6 text-white bg-white/20 hover:bg-white/40 p-2 rounded-full transition-colors" onClick={() => setPreviewModal(null)}>
                            <HiX className="w-6 h-6" />
                        </button>
                        <motion.img initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} src={previewModal ? SOCKET_URL + previewModal : null} alt="Preview" className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()} />
                        <div className="absolute bottom-6 flex gap-4">
                            <a href={previewModal ? SOCKET_URL + previewModal : null} download target="_blank" rel="noopener noreferrer" className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-full font-medium tracking-wide transition-colors backdrop-blur-md flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <HiOutlineDocumentDuplicate className="w-5 h-5" /> Download Image
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* DELETE MODAL */}
            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[20000] bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-3xl w-full max-w-sm p-7 shadow-2xl relative overflow-hidden border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Delete Conversation</h3>
                            <p className="text-sm text-gray-500 mb-5 leading-relaxed">Are you sure you want to permanently delete this conversation? This will remove:</p>
                            <ul className="text-sm text-gray-600 mb-8 pl-5 space-y-2">
                                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-red-400 rounded-full"></div>All messages</li>
                                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-red-400 rounded-full"></div>All attachments</li>
                                <li className="flex items-center gap-2"><div className="w-1 h-1 bg-red-400 rounded-full"></div>All chat history</li>
                            </ul>
                            <div className="flex justify-end gap-3 w-full">
                                <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 rounded-xl text-gray-700 hover:bg-gray-100 font-medium transition-colors" disabled={isDeletingChat}>Cancel</button>
                                <button onClick={handleDeleteConversation} className="flex-1 py-3 justify-center rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-all flex items-center gap-2 focus:ring-4 focus:ring-red-500/20 active:scale-95" disabled={isDeletingChat}>
                                    {isDeletingChat ? 'Deleting...' : 'Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* TOAST */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div initial={{ opacity: 0, y: 50, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 50, x: '-50%' }} className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3.5 rounded-2xl shadow-2xl shadow-black/20 z-[30000] flex items-center gap-2 text-[14px] font-medium min-w-[300px] justify-center border border-white/10 backdrop-blur-md">
                        {toastMessage}
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Gallery Modal */}
            <AnimatePresence>
                {showGallery && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black z-[10000] flex flex-col p-4 font-sans">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-white font-bold">Image Gallery</h3>
                            <button onClick={() => setShowGallery(false)} className="text-white p-2 hover:bg-white/10 rounded-full transition-all"><HiX className="w-6 h-6" /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 content-start pb-20">
                            {messages.filter(m => m.messageType === 'image' && !m.isDeleted).map(m => (
                                <div key={m._id} className="aspect-square relative rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity" onClick={() => { setPreviewModal(m.fileUrl); setShowGallery(false); }}>
                                    <img src={m.fileUrl ? `${SOCKET_URL}${m.fileUrl}` : null} alt="Gallery item" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                        {messages.filter(m => m.messageType === 'image' && !m.isDeleted).length === 0 && (
                            <div className="m-auto text-gray-400 text-center">No images found in this chat.</div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AdminChat;
