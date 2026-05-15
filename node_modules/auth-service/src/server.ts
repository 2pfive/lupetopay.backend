import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import { Request, Response } from "express"

dotenv.config()

const app = express()

app.use(express.json())
app.use(cors())

app.get('/roles',async(_req:Request,res:Response)=>{
})

app.listen(3300, () => {
    console.log("service d'authentifaction lancé");

})

export default app