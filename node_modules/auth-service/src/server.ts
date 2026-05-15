import express from "express"
import dotenv from "dotenv"
import cors from "cors"

dotenv.config()

const app = express()

app.use(express.json())
app.use(cors())

app.listen(3300, () => {
    console.log("service d'authentifaction lancé");

})

export default app