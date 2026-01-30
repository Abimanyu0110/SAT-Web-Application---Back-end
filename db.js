import mongoose from "mongoose";

// Store it in env variable
// const MONGODB_URI = "mongodb+srv://abimanyu0110_db_user:l7W8fk4Bo4l3ANhu@abimanyu.klwkm48.mongodb.net/?appName=abimanyu"

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        // await mongoose.connect(MONGODB_URI);

        console.log("✅ MongoDB connected");
    } catch (error) {
        console.error("❌ MongoDB connection error:", error);
        process.exit(1);
    }
};

export default connectDB;
