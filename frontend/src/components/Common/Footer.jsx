import React from 'react';
import { IoLogoInstagram } from 'react-icons/io';
import { RiTwitterXLine } from 'react-icons/ri';
import { TbBrandMeta } from 'react-icons/tb';
import { Link } from 'react-router-dom';
import {FiPhoneCall} from "react-icons/fi"

const Footer = () => {
  return (
    <footer className="border-t py-12">
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 px-4 lg:px-0">
            <div>
                <h3 className="text-lg text-[#2B2B2B] mb-4">Newletter</h3>
                <p className="text-gray-600 mb-4">Be the first to hear about our new collection, exclusive events, online offers.</p>
                <p className="font-medium text-sm text-gray-600 mb-6">Sign up for exclusive deals.</p>

                {/**NewsLetter form*/}
                <form className="flex">
                    <input type="email" placeholder="Enter your Email" className="p-3 w-full text-sm border-t border-l border-b
                     border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-gray-500 transition-all"/>
                     <button type="submit" className="bg-black text-white px-6 py-3 text-sm rounded-r-md hover:bg-gray-800 transition-all">
                        Subscribe
                     </button>
                </form>
            </div>
                {/**Shop links */}
                <div>
                    <h3 className="text-lg text-gray-800 mb-4">Shop</h3>
                    <ul className="space-y-2 text-gray-600">
                    <li>
                        <Link to="#" className="hover:text-gray-500 transition-colors">Sarees</Link>
                    </li>
                    <li>
                        <Link to="#" className="hover:text-gray-500 transition-colors">Dress</Link>
                    </li>
                    <li>
                        <Link to="#" className="hover:text-gray-500 transition-colors">Materials</Link>
                    </li>
                    <li>
                        <Link to="#" className="hover:text-gray-500 transition-colors">Top Wears</Link>
                    </li>
                    </ul>
                </div>
                {/**Support Links bro */}
                <div>
                    <h3 className="text-lg text-gray-800 mb-4">Support</h3>
                    <ul className="space-y-2 text-gray-600">
                    <li>
                        <Link to="#" className="hover:text-gray-500 transition-colors">Contact Us</Link>
                    </li>
                    <li>
                        <Link to="#" className="hover:text-gray-500 transition-colors">About Us</Link>
                    </li>
                    <li>
                        <Link to="#" className="hover:text-gray-500 transition-colors">FAQs</Link>
                    </li>
                    <li>
                        <Link to="#" className="hover:text-gray-500 transition-colors">Features</Link>
                    </li>
                    </ul>
                </div>
                {/** Follow us*/}
                <div>
                    <h3 className="text-lg text-gray-800 mb-4">Follow Us</h3>
                    <div className="flex items-center space-x-4 mb-6">
                        <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-500">
                        <TbBrandMeta className="h-5 w-5"/>
                        </a>
                        <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-500">
                        <IoLogoInstagram className="h-5 w-5"/>
                        </a>
                        <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-gray-500">
                        <RiTwitterXLine className="h-4 w-4"/>
                        </a>
                    </div>
                    <div>
                        <p className="text-gray-500">Call Us</p>
                        <p>
                            <FiPhoneCall className="inline-block mr-2 "/>
                            7337847118
                        </p>
                    </div>
                </div>

        </div>
        {/**Footerbuttom */}
        <div className="container mx-auto mt-12 px-4 lg:px-0 border-gray-200 pt-6"></div>
        <p className="text-gray-500 text;sm tracking-tighter text-center">
            © 2026, SLV. All rights reserved.
        </p>
    </footer>
  );
};

export default Footer;