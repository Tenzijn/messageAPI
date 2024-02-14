import express from "express";
import { getUsers, addUser, login } from "../controllers/usersController.js";
const userRouter = express.Router();

userRouter.get("/", getUsers);
userRouter.post("/", addUser);
userRouter.post("/login", login);

export default userRouter;
