const express= require("express")
const mongoose= require("mongoose")
const app= express()
const cors = require("cors")
const authRoutes=require("./routes/authRoutes")
require("dotenv").config()

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({
    extended:true
}))
mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("DB connected")
    })
    .catch((err)=>{
        console.log(err)
    })

app.get("/",(req,res)=>{
    res.json({message:"server is running"})
})
app.use("/api/auth",authRoutes)
app.listen(5000,()=>console.log("server runns on port 5000"))