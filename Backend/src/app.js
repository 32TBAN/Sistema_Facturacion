import express from "express";
import indexRoutes from "./routers/index.routes";
import "./database";
import morgan from 'morgan'
import cors from "cors";

const app = express()
app.use(express.json())
app.use(cors())
app.use(morgan('dev'))
app.use(indexRoutes)
app.use(express.urlencoded({extended: false}))


export default app;