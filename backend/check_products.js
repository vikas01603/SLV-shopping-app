const mongoose = require("mongoose");
const Product = require("./models/Product");
const dotenv = require("dotenv");

dotenv.config();

const checkProducts = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to DB");

        const total = await Product.countDocuments({});
        console.log("Total products:", total);

        const published = await Product.countDocuments({ isPublished: true });
        console.log("Published products:", published);

        const draft = await Product.countDocuments({ isPublished: false });
        console.log("Draft products:", draft);

        const allCollection = await Product.countDocuments({ collections: "All" });
        console.log("Products with collection='All':", allCollection);

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkProducts();
