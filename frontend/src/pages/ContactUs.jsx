import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';
import { HiOutlineChatBubbleLeftEllipsis, HiPaperAirplane } from "react-icons/hi2";

const SOCKET_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

const ContactUs = () => {
    const { user } = useSelector((state) => state.auth);
    const [room, setRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [socket, setSocket] = useState(null);
    const messagesEndRef = useRef(null);

    // Initialize Socket
    useEffect(() => {
        if (!user || user.role === 'admin') return;

        const newSocket = io(SOCKET_URL);
        setSocket(newSocket);

        return () => newSocket.close();
    }, [user]);

    // Fetch or create room
    useEffect(() => {
        const fetchRoomAndMessages = async () => {
            if (!user || user.role === 'admin') return;
            try {
                const config = { headers: { Authorization: `Bearer ${localStorage.getItem('userToken')}` } };
                const res = await axios.get(`${SOCKET_URL}/api/chat/my-room`, config);
                setRoom(res.data);

                if (res.data) {
                    const msgRes = await axios.get(`${SOCKET_URL}/api/chat/${res.data._id}/messages`, config);
                    setMessages(msgRes.data);
                }
            } catch (error) {
                console.error("Failed to fetch chat room", error);
            }
        };

        fetchRoomAndMessages();
    }, [user]);

    // Socket listeners
    useEffect(() => {
        if (!socket || !room) return;

        socket.emit('join_room', room._id);

        socket.on('receive_message', (msg) => {
            setMessages((prev) => [...prev, msg]);
            socket.emit('mark_read', { roomId: room._id, readerType: 'User' });
        });

        socket.on('display_typing', (data) => {
            if (data.senderType === 'Admin') {
                setIsTyping(data.isTyping);
            }
        });

        socket.on('messages_seen', (data) => {
            if (data.readerType === 'Admin') {
                setMessages(prev => prev.map(m => m.status !== 'Seen' && m.senderType === 'User' ? { ...m, status: 'Seen' } : m));
            }
        });

        return () => {
            socket.off('receive_message');
            socket.off('display_typing');
            socket.off('messages_seen');
        };
    }, [socket, room]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    useEffect(() => {
        if (room && socket) {
            socket.emit('mark_read', { roomId: room._id, readerType: 'User' });
        }
    }, [room, socket]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !socket || !room) return;

        const msgData = {
            roomId: room._id,
            sender: user._id,
            senderType: 'User',
            message: newMessage,
        };

        socket.emit('send_message', msgData);
        setNewMessage("");
        socket.emit('typing', { roomId: room._id, senderType: 'User', isTyping: false });
    };

    const handleTyping = (e) => {
        setNewMessage(e.target.value);
        if (socket && room) {
            socket.emit('typing', { roomId: room._id, senderType: 'User', isTyping: e.target.value.length > 0 });
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-dark pt-20 pb-12 transition-colors duration-300 flex flex-col justify-center">
            <div className="container mx-auto px-6 lg:px-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="max-w-5xl mx-auto space-y-16"
                >
                    <div className="text-center space-y-6">
                        <h1 className="text-4xl md:text-5xl font-bold text-neutral-dark dark:text-white uppercase tracking-tight">Contact Us</h1>
                        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
                            We'd love to hear from you. Whether you have a question about our collections, need styling advice, or assistance with an order, our team is ready to help.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Contact Information */}
                        <div className="space-y-8 bg-gray-50 dark:bg-neutral-800 p-8 rounded-2xl shadow-inner">
                            <h2 className="text-2xl font-bold text-neutral-dark dark:text-white uppercase">Get in Touch</h2>
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Address</h3>
                                    <p className="text-gray-800 dark:text-gray-200 text-lg">
                                        SLV Fashions Boutique<br />
                                        123 Style Avenue<br />
                                        Fashion City, FC 12345
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Email</h3>
                                    <p className="text-gray-800 dark:text-gray-200 text-lg">
                                        <a href="mailto:support@slv.com" className="hover:text-black dark:hover:text-white transition-colors">support@slv.com</a>
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Phone / WhatsApp</h3>
                                    <p className="text-gray-800 dark:text-gray-200 text-lg">
                                        <a href="https://wa.me/917337847118" target="_blank" rel="noopener noreferrer" className="hover:text-[#25D366] transition-colors">+91 7337847118</a>
                                    </p>
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">Business Hours</h3>
                                    <p className="text-gray-800 dark:text-gray-200 text-lg">
                                        Monday - Friday: 9am - 6pm (IST)<br />
                                        Saturday: 10am - 4pm (IST)
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Live Chat System */}
                        <div className="space-y-6 flex flex-col h-[550px]">
                            {/* Header */}
                            <div className="bg-black text-white p-4 rounded-t-2xl flex justify-between items-center shadow-md z-10">
                                <div>
                                    <h3 className="font-semibold text-lg uppercase tracking-wide">Customer Support</h3>
                                    <p className="text-xs text-gray-300 flex items-center gap-2 mt-1">
                                        <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse"></span>
                                        Support Online
                                    </p>
                                </div>
                            </div>

                            {!user ? (
                                <div className="flex-1 bg-gray-50 dark:bg-neutral-800 rounded-b-2xl border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center p-8 gap-4">
                                    <HiOutlineChatBubbleLeftEllipsis className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-2" />
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Login required</h3>
                                    <p className="text-gray-500 dark:text-gray-400 max-w-xs">Please log in or register an account to chat with our support team.</p>
                                </div>
                            ) : user.role === 'admin' ? (
                                <div className="flex-1 bg-gray-50 dark:bg-neutral-800 rounded-b-2xl border border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center text-center p-8 gap-4">
                                    <HiOutlineChatBubbleLeftEllipsis className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-2" />
                                    <h3 className="text-xl font-bold text-gray-800 dark:text-white">Admin Dashboard</h3>
                                    <p className="text-gray-500 dark:text-gray-400 max-w-xs">Please visit the Admin support chat dashboard to respond to customers.</p>
                                </div>
                            ) : (
                                <div className="flex flex-col flex-1 bg-gray-50 dark:bg-neutral-800 shadow-inner rounded-b-2xl border border-t-0 border-gray-100 dark:border-gray-700 overflow-hidden">
                                    {/* Messages Area */}
                                    <div className="flex-1 p-6 overflow-y-auto flex flex-col gap-4">
                                        {messages.length === 0 ? (
                                            <div className="m-auto text-center text-gray-400 flex flex-col items-center justify-center h-full">
                                                <HiOutlineChatBubbleLeftEllipsis className="w-16 h-16 mb-4 opacity-40" />
                                                <p className="text-lg font-medium">No messages yet.</p>
                                                <p className="text-sm mt-2">Send a message to start chatting with us!</p>
                                            </div>
                                        ) : (
                                            messages.map((msg, index) => (
                                                <div key={index} className={`max-w-[75%] rounded-2xl px-5 py-3 ${msg.senderType === 'User' ? 'bg-black text-white self-end rounded-br-sm shadow-md' : 'bg-white dark:bg-neutral-700 border border-gray-200 dark:border-gray-600 text-gray-800 dark:text-gray-100 self-start rounded-bl-sm shadow-sm'}`}>
                                                    <p className="text-sm md:text-[15px] whitespace-pre-wrap">{msg.message}</p>
                                                    <div className={`text-[10px] mt-2 flex justify-end items-center gap-1.5 ${msg.senderType === 'User' ? 'text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        {msg.senderType === 'User' && (
                                                            <span>
                                                                {msg.status === 'Sent' ? '✓' : msg.status === 'Delivered' ? '✓✓' : <span className="text-blue-400 font-bold">✓✓</span>}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                        {isTyping && (
                                            <div className="bg-white dark:bg-neutral-700 border border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 self-start rounded-2xl rounded-bl-sm px-5 py-3 shadow-sm italic text-sm animate-pulse">
                                                Support is typing...
                                            </div>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Input Area */}
                                    <div className="p-4 bg-white dark:bg-neutral-900 border-t border-gray-200 dark:border-gray-700">
                                        <form onSubmit={handleSendMessage} className="flex gap-3">
                                            <input
                                                type="text"
                                                value={newMessage}
                                                onChange={handleTyping}
                                                placeholder="Type your message..."
                                                className="flex-1 border bg-gray-50 dark:bg-neutral-800 border-gray-300 dark:border-gray-600 rounded-xl px-5 py-3 text-neutral-dark dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent transition-all"
                                            />
                                            <button
                                                type="submit"
                                                disabled={!newMessage.trim()}
                                                className="bg-black text-white dark:bg-white dark:text-black px-6 rounded-xl font-bold uppercase tracking-wide hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center shadow-md"
                                            >
                                                Send <HiPaperAirplane className="w-5 h-5 ml-2 -rotate-45" />
                                            </button>
                                        </form>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ContactUs;
