const express = require("express");
const app = express();
const cors = require("cors")
const PORT = 8000;
app.use(cors());
app.use(express.json())
require('dotenv').config()
const fs = require('fs');
const multer = require('multer')

const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

const storage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'public')
    },
    filename:(req,file,cb)=>{
        cb(null,Date.now() +"-"+file.originalname)
    }
})
const upload = multer({storage:storage}).single('file')
let filePath;
app.post('/upload',(req,res)=>{
   upload(req,res,(err)=>{
    if(err){
        return res.send(500).json(err);
    }
    filePath = req.file.path;
    console.log(filePath)
    res.json({ message: 'File uploaded successfully', filePath });
   })
})

app.post("/gemini",async(req,res)=>{
    try {

        function fileToGenerativePath(path,mimeType){
            return {
                inlineData:{
                    data: Buffer.from(fs.readFileSync(path)).toString("base64"),
                    mimeType
                }
            }
        }
        
        const model = genAI.getGenerativeModel({model:"gemini-1.5-flash-latest"})
        const prompt = req.body.message;
        const result = await model.generateContent([prompt,fileToGenerativePath(filePath,"image/jpeg")])
        const response = result.response
        const responseText = response.text();
        res.send(responseText);
        
    } catch (err) {
        console.log(err);
    }
})






app.listen(PORT,()=>{
console.log(`Listening to the changes at port ${PORT}`)
})