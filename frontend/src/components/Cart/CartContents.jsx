import React from 'react';
import { RiDeleteBin3Line } from 'react-icons/ri';
import { useDispatch } from 'react-redux';
import { removeFromCart, updateCartItemQuantity } from '../../redux/slices/cartSlice';

const CartContents = ({ cart, userId, guestId }) => {

    const dispatch = useDispatch();

    //Handle adding or substracting to cart
    const handleAddCart = (productId, delta, quantity, size, color) => {
        const newQuantity = quantity + delta;
        if (newQuantity >= 1) {
            dispatch(updateCartItemQuantity({
                productId,
                quantity: newQuantity,
                guestId,
                userId,
                size,
                color,
            }));
        }
    }

    const handleRemoveFromCart = (productId, size, color) => {
        dispatch(removeFromCart({
            productId,
            guestId,
            userId,
            size,
            color,
        }));
    }

    return (
        <div>
            {
                cart.products.map((product, index) => (
                    <div key={index} className="flex items-start justify-between py-4 border-b border-gray-100 last:border-none">
                        <div className="flex items-start gap-4">
                            <img src={product.image} alt={product.name} className="w-20 h-28 object-cover rounded-lg shadow-sm bg-gray-50" />

                            <div className="flex flex-col justify-between h-28">
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-900 mb-1">{product.name}</h3>
                                    <p className="text-sm text-gray-500 tracking-wide">
                                        Size: {product.size} | Color: {product.color}
                                    </p>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => handleAddCart(product.productId, -1, product.quantity, product.size, product.color)}
                                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
                                    >
                                        -
                                    </button>
                                    <span className="text-gray-900 font-medium w-6 text-center">{product.quantity}</span>
                                    <button
                                        onClick={() => handleAddCart(product.productId, 1, product.quantity, product.size, product.color)}
                                        className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100 transition-colors"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end justify-between h-28">
                            <p className="font-bold text-lg text-gray-900">₹ {product.price.toLocaleString()}</p>
                            <button
                                onClick={() => handleRemoveFromCart(product.productId, product.size, product.color)}
                                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                                title="Remove Item"
                            >
                                <RiDeleteBin3Line className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                ))
            }
        </div>
    );
};

export default CartContents;
