import express from "express";
import authRoutes from "./routes/authRoutes"

const app = express();
app.use(express.json());

app.get("/" , (req , res)=>{
    console.log("Hi");
    res.json({
        message:"CEX Backend is Running"
    })
})

app.use("/auth" , authRoutes);

app.listen(process.env.PORT , ()=>{
    console.log(`Backend is running successfully at port ${process.env.PORT}`)
})
