import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import imageCompression from 'browser-image-compression';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { HiOutlineChatBubbleLeftEllipsis, HiMiniXMark, HiPaperAirplane, HiOutlinePaperClip, HiOutlineUserCircle } from "react-icons/hi2";
import { HiOutlineEmojiHappy, HiDotsVertical, HiX, HiOutlineReply, HiOutlineSearch, HiOutlineDocumentDuplicate, HiOutlineTrash } from "react-icons/hi";
import EmojiPicker from 'emoji-picker-react';
import { motion, AnimatePresence } from 'framer-motion';

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

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

const ChatWidget = () => {
    const { user } = useSelector((state) => state.auth);
    const [isOpen, setIsOpen] = useState(false);
    const [room, setRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [isSupportOnline, setIsSupportOnline] = useState(true);
    const [socket, setSocket] = useState(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Feature States
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

    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    // Initialize Socket
    useEffect(() => {
        if (!user || user.role === 'admin') return;
        const newSocket = io(SOCKET_URL, { transports: ["websocket"] });
        setSocket(newSocket);

        newSocket.emit('user_connect', { userId: user._id, role: 'User' });

        return () => newSocket.close();
    }, [user]);

    // Open listener from Footer
    useEffect(() => {
        const handleOpenChat = () => setIsOpen(true);
        window.addEventListener('open-chat', handleOpenChat);
        return () => window.removeEventListener('open-chat', handleOpenChat);
    }, []);

    // Fetch initial
    useEffect(() => {
        const fetchInitial = async () => {
            if (!user || user.role === 'admin') return;
            try {
                const config = { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } };
                const res = await axios.get(`${SOCKET_URL}/api/chat/my-room`, config);
                setRoom(res.data);

                if (res.data) {
                    const msgRes = await axios.get(`${SOCKET_URL}/api/chat/${res.data._id}/messages?page=1&limit=30`, config);
                    setMessages(msgRes.data.messages || []);
                    setPage(msgRes.data.page);
                    setHasMore(msgRes.data.page < msgRes.data.pages);
                }
            } catch (error) {
                console.error("Failed to fetch chat room", error);
            }
        };
        fetchInitial();
    }, [user]);

    // Load Older
    const handleScroll = async (e) => {
        if (e.target.scrollTop === 0 && hasMore) {
            try {
                const config = { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } };
                const msgRes = await axios.get(`${SOCKET_URL}/api/chat/${room._id}/messages?page=${page + 1}&limit=30`, config);
                setMessages(prev => [...msgRes.data.messages, ...prev]);
                setPage(msgRes.data.page);
                setHasMore(msgRes.data.page < msgRes.data.pages);
            } catch (err) { }
        }
    };

    // Socket listeners
    useEffect(() => {
        if (!socket || !room) return;
        socket.emit('join_room', room._id);

        const receiveMessage = (msg) => {
            setMessages((prev) => [...prev, msg]);
            if (msg.senderType !== 'User') playPopSound();
            if (isOpen) socket.emit('mark_read', { roomId: room._id, readerType: 'User' });
        };
        const displayTyping = (data) => {
            if (data.senderType === 'Admin') setIsTyping(data.isTyping);
        };
        const messagesSeen = (data) => {
            if (data.readerType === 'Admin') {
                setMessages(prev => prev.map(m => m.status !== 'Seen' && m.senderType === 'User' ? { ...m, status: 'Seen' } : m));
            }
        };
        const messageEdited = (editedMsg) => {
            setMessages(prev => prev.map(m => m._id === editedMsg._id ? editedMsg : m));
        };
        const messageDeleted = (deletedMsg) => {
            setMessages(prev => prev.map(m => m._id === deletedMsg._id ? deletedMsg : m));
        };
        const messageReaction = (data) => {
            setMessages(prev => prev.map(m => m._id === data.messageId ? { ...m, reactions: data.reactions } : m));
        };
        const supportStatus = (isOnline) => {
            setIsSupportOnline(isOnline);
        };
        const conversationDeleted = (data) => {
            if (room && room._id === data.roomId) {
                setMessages([]);
                setAttachment(null);
                setEditingMsg(null);
                setReplyingTo(null);

                const config = { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } };
                axios.get(`${SOCKET_URL}/api/chat/my-room`, config)
                    .then(res => setRoom(res.data))
                    .catch(console.error);
            }
        };

        socket.on('receive_message', receiveMessage);
        socket.on('display_typing', displayTyping);
        socket.on('messages_seen', messagesSeen);
        socket.on('message_edited', messageEdited);
        socket.on('message_deleted', messageDeleted);
        socket.on('message_reaction', messageReaction);
        socket.on('admin_status', supportStatus);
        socket.on('conversation_deleted', conversationDeleted);

        // Initial check for support
        socket.emit('check_admin_status');

        return () => {
            socket.off('receive_message', receiveMessage);
            socket.off('display_typing', displayTyping);
            socket.off('messages_seen', messagesSeen);
            socket.off('message_edited', messageEdited);
            socket.off('message_deleted', messageDeleted);
            socket.off('message_reaction', messageReaction);
            socket.off('admin_status', supportStatus);
            socket.off('conversation_deleted', conversationDeleted);
        };
    }, [socket, room, isOpen]);

    useEffect(() => {
        if (!editingMsg && messages[messages.length - 1]?.senderType === 'User' && !searchTerm) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, searchTerm]);

    useEffect(() => {
        if (isOpen && room && socket) {
            socket.emit('mark_read', { roomId: room._id, readerType: 'User' });
            messagesEndRef.current?.scrollIntoView();
        }
    }, [isOpen, room, socket]);

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
        if (!socket || !room) return;
        if (!newMessage.trim() && !attachment) return;

        if (editingMsg) {
            socket.emit('edit_message', { messageId: editingMsg._id, newText: newMessage, roomId: room._id });
            setEditingMsg(null);
            setNewMessage("");
            return;
        }

        const msgData = {
            roomId: room._id,
            sender: user._id,
            senderType: 'User',
            message: newMessage,
            messageType: attachment ? attachment.type : 'text',
            fileUrl: attachment?.url || null,
            fileName: attachment?.name || null,
            fileSize: attachment?.size || null,
            mimeType: attachment?.mimeType || null,
            replyTo: replyingTo?._id || null
        };

        socket.emit('send_message', msgData);
        setNewMessage("");
        setAttachment(null);
        setReplyingTo(null);
        setShowEmojiPicker(false);
        socket.emit('typing', { roomId: room._id, senderType: 'User', isTyping: false });
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e);
        }
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        if (socket && room) {
            socket.emit('typing', { roomId: room._id, senderType: 'User', isTyping: e.target.value.length > 0 });
        }
    };

    const startEdit = (msg) => {
        setEditingMsg(msg);
        setNewMessage(msg.message);
        setActiveMenu(null);
    };

    const deleteMsg = (msgId, forEveryone = true) => {
        if (socket && room) {
            socket.emit('delete_message', { messageId: msgId, roomId: room._id, deleteForEveryone: forEveryone, deletedBy: 'User' });
        }
        setActiveMenu(null);
    };

    const toggleReaction = (msgId, emojiStr) => {
        if (socket && room) {
            socket.emit('reaction_added', { messageId: msgId, roomId: room._id, emoji: emojiStr, userId: user._id });
        }
        setActiveMenu(null);
    };

    const copyText = (text) => {
        navigator.clipboard.writeText(text);
        setActiveMenu(null);
    };

    if (!user || user.role === 'admin') return null;

    // Filter Messages
    const filteredMessages = messages
        .filter(m => !(m.isDeleted && !m.deletedForEveryone && m.deletedBy === 'User'))
        .filter(m => m.message?.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[9999] font-sans">
            <AnimatePresence>
                {isOpen ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="bg-white w-full h-[100dvh] fixed inset-0 sm:inset-auto sm:bottom-20 sm:right-6 sm:w-[400px] sm:h-[600px] sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden border-0 sm:border border-gray-200 sm:max-h-[85vh] z-[9999]"
                    >

                        {/* Header */}
                        <div className="bg-gradient-to-r from-gray-900 to-black text-white p-4 flex justify-between items-center z-20 shadow-md relative">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-10 h-10 bg-white/10 flex items-center justify-center rounded-full border border-gray-600">
                                        <HiOutlineChatBubbleLeftEllipsis className="w-5 h-5 text-gray-200" />
                                    </div>
                                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900 ${isSupportOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-[15px] tracking-wide text-white">Customer Support</h3>
                                    <p className="text-[11px] text-gray-300">{isSupportOnline ? 'Online' : 'Offline'}</p>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button onClick={() => setShowSearch(!showSearch)} className="text-gray-400 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-all">
                                    <HiOutlineSearch className="w-5 h-5" />
                                </button>
                                <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white hover:bg-white/10 p-1.5 rounded-full transition-all">
                                    <HiMiniXMark className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Search Bar */}
                        <AnimatePresence>
                            {showSearch && (
                                <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="bg-gray-50 border-b border-gray-200 px-3 py-2 z-10 overflow-hidden font-sans">
                                    <input type="text" placeholder="Search in chat..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-white border border-gray-200 rounded-lg text-[13px] px-3 py-1.5 focus:ring-1 focus:ring-black outline-none transition-all" />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Messages Area */}
                        <div
                            ref={chatContainerRef}
                            onScroll={handleScroll}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            className={`flex-1 p-5 overflow-y-auto bg-gray-50 flex flex-col gap-5 relative custom-scrollbar ${isDragging ? 'bg-blue-50/50 border-2 border-dashed border-blue-400' : ''}`}
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

                            {filteredMessages.length === 0 ? (
                                <div className="m-auto text-center text-gray-400 flex flex-col items-center">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <HiOutlineChatBubbleLeftEllipsis className="w-8 h-8 text-gray-400" />
                                    </div>
                                    <p className="font-medium text-gray-800">{searchTerm ? 'No matching messages' : 'No messages yet'}</p>
                                    <p className="text-xs text-gray-500 mt-1">{searchTerm ? 'Try a different keyword' : 'Send a message to start chatting!'}</p>
                                </div>
                            ) : (
                                filteredMessages.map((msg, index) => {
                                    const isMe = msg.senderType === 'User';
                                    const isDeleted = msg.isDeleted;
                                    const showAvatar = !isMe && (index === 0 || filteredMessages[index - 1].senderType === 'User');

                                    const msgDate = new Date(msg.createdAt).toLocaleDateString();
                                    const prevDate = index > 0 ? new Date(filteredMessages[index - 1].createdAt).toLocaleDateString() : null;
                                    const showDateHeader = msgDate !== prevDate && !searchTerm;

                                    return (
                                        <React.Fragment key={msg._id || index}>
                                            {showDateHeader && (
                                                <div className="flex justify-center my-1 w-full relative z-0">
                                                    <span className="text-[10px] bg-gray-200 text-gray-600 px-2.5 py-1 rounded-full font-medium tracking-wide">
                                                        {msgDate === new Date().toLocaleDateString() ? 'Today' : msgDate}
                                                    </span>
                                                </div>
                                            )}

                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.15 }}
                                                className={`relative flex ${isMe ? 'justify-end' : 'justify-start'} group w-full`}
                                            >
                                                {!isMe && (
                                                    <div className="w-8 flex-shrink-0 mr-2 flex flex-col justify-end">
                                                        {showAvatar && (
                                                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mb-1">
                                                                <HiOutlineChatBubbleLeftEllipsis className="w-4 h-4 text-gray-500" />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                                                    {msg.replyTo && !isDeleted && (
                                                        <div className={`text-[11px] p-2 mb-1.5 rounded-md opacity-90 border-l-2 truncate w-full ${isMe ? 'bg-gray-200 border-black text-black' : 'bg-gray-200 border-gray-400 text-gray-700'}`}>
                                                            <span className="font-semibold block">{msg.replyTo.senderType === 'Admin' ? 'Support' : 'You'}</span>
                                                            {msg.replyTo.message || "Attachment"}
                                                        </div>
                                                    )}

                                                    <div className={`relative px-4 py-2.5 shadow-sm 
                                                    ${isDeleted ? 'bg-white text-gray-400 italic border border-gray-200 rounded-2xl'
                                                            : isMe ? 'bg-black text-white rounded-2xl rounded-br-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-bl-sm'}
                                                    `}>
                                                        {!isDeleted && (
                                                            <button
                                                                onClick={() => setActiveMenu(activeMenu === msg._id ? null : msg._id)}
                                                                className={`absolute top-2.5 ${isMe ? '-left-8' : '-right-8'} opacity-0 group-hover:opacity-100 text-gray-400 hover:text-black transition-opacity p-1 bg-white rounded-full shadow-sm border border-gray-100`}
                                                            >
                                                                <HiDotsVertical className="w-4 h-4" />
                                                            </button>
                                                        )}

                                                        {!isDeleted && msg.fileUrl && (
                                                            <div className={`mb-2 ${msg.message ? 'border-b border-gray-200/20 pb-2' : ''}`}>
                                                                {msg.messageType === 'image' ? (
                                                                    <div onClick={() => setPreviewModal(msg.fileUrl)} className="cursor-pointer overflow-hidden rounded-xl bg-white border border-gray-100 flex items-center justify-center">
                                                                        <img src={SOCKET_URL + msg.fileUrl} alt="Attachment" className="max-w-full max-h-48 object-cover hover:scale-105 transition-transform duration-300" />
                                                                    </div>
                                                                ) : (
                                                                    <div className={`flex items-center justify-between gap-3 p-2 rounded-xl ${isMe ? 'bg-gray-800/80 border border-gray-700' : 'bg-gray-100 border border-gray-200'} transition-colors mt-1`}>
                                                                        <div className="flex items-center gap-2 overflow-hidden">
                                                                            <div className={`p-2 rounded-lg ${isMe ? 'bg-gray-700' : 'bg-white shadow-sm'}`}>
                                                                                <HiOutlinePaperClip className="w-5 h-5 shrink-0" />
                                                                            </div>
                                                                            <div className="flex flex-col truncate">
                                                                                <span className="text-[12px] font-semibold truncate leading-tight">{msg.fileName || "Document"}</span>
                                                                                <span className={`text-[10px] ${isMe ? 'text-gray-400' : 'text-gray-500'}`}>{msg.fileSize ? (msg.fileSize / 1024 / 1024).toFixed(2) + ' MB' : msg.mimeType?.split('/')[1] || 'File'}</span>
                                                                            </div>
                                                                        </div>
                                                                        <a href={SOCKET_URL + msg.fileUrl} download={msg.fileName} target="_blank" rel="noopener noreferrer" className={`p-1.5 rounded-full ${isMe ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'} transition-colors shrink-0`}>
                                                                            <HiOutlineDocumentDuplicate className="w-4 h-4" />
                                                                        </a>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}

                                                        <p className="text-[14px] whitespace-pre-wrap leading-relaxed tracking-wide">
                                                            {searchTerm && msg.message ? (
                                                                // Highlight logic for search
                                                                msg.message.split(new RegExp(`(${searchTerm})`, 'gi')).map((part, i) =>
                                                                    part.toLowerCase() === searchTerm.toLowerCase() ? <mark key={i} className="bg-yellow-300 text-black px-0.5 rounded">{part}</mark> : part
                                                                )
                                                            ) : msg.message}
                                                        </p>

                                                        {msg.reactions && msg.reactions.length > 0 && !isDeleted && (
                                                            <div className={`absolute -bottom-3 ${isMe ? 'right-2' : 'left-2'} bg-white border border-gray-200 shadow-sm rounded-full px-1.5 py-0.5 text-[11px] flex gap-1 z-10 items-center`}>
                                                                {Array.from(new Set(msg.reactions.map(r => r.emoji))).map(emoji => (
                                                                    <span key={emoji} className="cursor-pointer hover:scale-110 transition-transform flex items-center gap-0.5 text-gray-700" onClick={() => toggleReaction(msg._id, emoji)}>
                                                                        {emoji} <span className="text-[9px] font-medium">{msg.reactions.filter(r => r.emoji === emoji).length}</span>
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>

                                                    <div className={`text-[10px] mt-1 flex items-center gap-1.5 w-full ${isMe ? 'justify-end text-gray-400' : 'justify-start text-gray-400 px-1'}`}>
                                                        {msg.isEdited && !isDeleted && <span className="italic mr-0.5">(edited)</span>}
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        {isMe && !isDeleted && (
                                                            <span className="font-bold tracking-tighter">
                                                                {msg.status === 'Sent' ? '✓' : msg.status === 'Delivered' ? '✓✓' : <span className="text-blue-500">✓✓</span>}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <AnimatePresence>
                                                        {activeMenu === msg._id && !isDeleted && (
                                                            <motion.div
                                                                initial={{ opacity: 0, scale: 0.95 }}
                                                                animate={{ opacity: 1, scale: 1 }}
                                                                exit={{ opacity: 0, scale: 0.95 }}
                                                                className={`absolute top-6 ${isMe ? 'right-[105%] mr-2' : 'left-[105%] ml-2'} z-50 bg-white shadow-xl border border-gray-100 rounded-xl w-48 text-sm overflow-hidden flex flex-col py-1.5`}
                                                            >
                                                                <button onClick={() => { setReplyingTo(msg); setActiveMenu(null); }} className="px-4 py-2 text-left hover:bg-gray-50 text-gray-700 flex items-center gap-2 font-medium transition-colors"><HiOutlineReply className="w-4 h-4" /> Reply</button>
                                                                <div className="px-4 py-2 flex justify-between bg-gray-50/50 my-1 border-y border-gray-100">
                                                                    {['👍', '❤️', '😂', '😮', '😢'].map(em => (
                                                                        <span key={em} className="cursor-pointer hover:scale-125 transition-transform text-lg" onClick={() => toggleReaction(msg._id, em)}>{em}</span>
                                                                    ))}
                                                                </div>
                                                                {msg.message && <button onClick={() => copyText(msg.message)} className="px-4 py-2 text-left hover:bg-gray-50 text-gray-700 flex items-center gap-2 font-medium transition-colors"><HiOutlineDocumentDuplicate className="w-4 h-4" /> Copy Text</button>}
                                                                {isMe && <button onClick={() => startEdit(msg)} className="px-4 py-2 text-left hover:bg-gray-50 text-gray-700 flex items-center gap-2 font-medium transition-colors">Edit Message</button>}
                                                                {isMe && <button onClick={() => deleteMsg(msg._id, false)} className="px-4 py-2 text-left hover:bg-red-50 text-red-600 flex items-center gap-2 font-medium transition-colors mt-1 border-t border-gray-100 pt-2"><HiOutlineTrash className="w-4 h-4" /> Delete for me</button>}
                                                                {isMe && <button onClick={() => deleteMsg(msg._id, true)} className="px-4 py-2 text-left hover:bg-red-50 text-red-600 flex items-center gap-2 font-medium transition-colors border-t border-gray-100"><HiOutlineTrash className="w-4 h-4" /> Delete for everyone</button>}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </motion.div>
                                        </React.Fragment>
                                    )
                                })
                            )}

                            {isTyping && (
                                <div className="flex justify-start w-full relative">
                                    <div className="w-8 flex-shrink-0 mr-2 flex flex-col justify-end">
                                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mb-1">
                                            <HiOutlineChatBubbleLeftEllipsis className="w-4 h-4 text-gray-500" />
                                        </div>
                                    </div>
                                    <div className="bg-white border border-gray-200 text-gray-400 rounded-2xl px-5 py-3 shadow-sm rounded-bl-sm flex items-center gap-1.5 self-start h-[38px]">
                                        <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                                        <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                                        <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} className="h-4" />
                        </div>

                        {/* Pre-send UI */}
                        <div className="bg-white border-t border-gray-100 px-4 relative z-20 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]">
                            <AnimatePresence>
                                {showEmojiPicker && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute bottom-full right-4 mb-2 shadow-2xl z-50 rounded-xl overflow-hidden border border-gray-100"
                                    >
                                        <EmojiPicker onEmojiClick={(e) => { setNewMessage(prev => prev + e.emoji); setShowEmojiPicker(false); }} />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {replyingTo && (
                                <div className="bg-gray-50 p-2.5 text-xs flex justify-between items-center rounded-t-xl mt-3 border-l-[3px] border-black">
                                    <div className="truncate pr-4 text-gray-600 max-w-[250px]">
                                        <span className="font-semibold text-black mr-2">Replying to:</span>
                                        {replyingTo.message || "Attachment"}
                                    </div>
                                    <button onClick={() => setReplyingTo(null)} className="text-gray-400 hover:text-black p-1 hover:bg-gray-200 rounded-md transition-colors"><HiX /></button>
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
                                <div className="bg-yellow-50/50 p-2.5 text-xs flex justify-between items-center rounded-t-xl mt-3 border-l-[3px] border-yellow-400">
                                    <span className="text-yellow-700 font-medium">Editing message...</span>
                                    <button onClick={() => { setEditingMsg(null); setNewMessage(""); }} className="text-gray-400 hover:text-black p-1 hover:bg-yellow-100 rounded-md transition-colors"><HiX /></button>
                                </div>
                            )}
                        </div>

                        {/* Input */}
                        <div className="p-3 bg-white flex flex-col pb-4 z-20 relative">
                            <form onSubmit={handleSendMessage} className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-[20px] px-2 py-1.5 focus-within:ring-2 focus-within:ring-black/5 focus-within:border-black/20 focus-within:bg-white transition-all shadow-sm">
                                <label className={`p-2.5 text-gray-400 hover:text-black cursor-pointer rounded-full hover:bg-gray-100 transition-colors ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                    <HiOutlinePaperClip className="w-[22px] h-[22px]" />
                                    <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                                </label>

                                <textarea
                                    value={newMessage}
                                    onChange={handleTyping}
                                    onKeyDown={handleKeyDown}
                                    disabled={(!newMessage.trim() && !attachment) || uploading}
                                    placeholder={uploading ? `Uploading ${uploadProgress}%...` : "Message support..."}
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-[14px] max-h-28 min-h-[44px] resize-none py-3 outline-none custom-scrollbar placeholder:text-gray-400 self-center"
                                    rows="1"
                                />

                                <button type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2.5 text-gray-400 hover:text-black rounded-full hover:bg-gray-100 transition-colors">
                                    <HiOutlineEmojiHappy className="w-[22px] h-[22px]" />
                                </button>

                                <button
                                    type="submit"
                                    disabled={(!newMessage.trim() && !attachment) || uploading}
                                    className="group bg-black text-white w-10 h-10 rounded-full mb-0.5 mr-0.5 cursor-pointer hover:bg-gray-800 hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0 active:scale-95"
                                >
                                    <HiPaperAirplane className="w-5 h-5 -rotate-45 ml-0.5 mb-0.5 group-hover:scale-110 transition-transform" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                ) : null}
            </AnimatePresence>

            {/* PREVIEW MODAL */}
            <AnimatePresence>
                {previewModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[10000] bg-black/90 flex flex-col items-center justify-center backdrop-blur-sm" onClick={() => setPreviewModal(null)}>
                        <button className="absolute top-6 right-6 text-white bg-white/20 hover:bg-white/40 p-2 rounded-full transition-colors" onClick={() => setPreviewModal(null)}>
                            <HiMiniXMark className="w-6 h-6" />
                        </button>
                        <motion.img initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} src={SOCKET_URL + previewModal} alt="Preview" className="max-w-[90vw] max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10" onClick={(e) => e.stopPropagation()} />
                        <div className="absolute bottom-6 flex gap-4">
                            <a href={SOCKET_URL + previewModal} download target="_blank" rel="noopener noreferrer" className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-full font-medium tracking-wide transition-colors backdrop-blur-md flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                <HiOutlineDocumentDuplicate className="w-5 h-5" /> Download Image
                            </a>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {!isOpen && (
                <motion.button
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(true)}
                    className="bg-black text-white w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-2xl flex items-center justify-center relative group"
                >
                    <HiOutlineChatBubbleLeftEllipsis className="w-7 h-7 sm:w-8 sm:h-8" />
                    {room && room.unreadCountUser > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[11px] font-bold w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-full border-2 border-white shadow-sm ring-2 ring-red-500/30 animate-pulse">
                            {room.unreadCountUser}
                        </span>
                    )}
                </motion.button>
            )}
        </div>
    );
};

export default ChatWidget;
