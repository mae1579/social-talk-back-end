import express from 'express';
import {model as User} from "../models/User";
import bcrypt from "bcrypt";

export const loginRouter = express.Router();


loginRouter
    .post('/', async (req, res) => {


        const user = await User.findOne({email: req.body.email});

        if (!user) {

            res
                .send('Podano zły login lub hasło ')
                .status(401);


        }


        if (await bcrypt.compare(req.body.password, user.password)) {

            user.status = "online";


            res
                .status(200)
                .json(user);


        } else {

            res
                .send('Podano zły login lub hasło ')
                .status(401);


        }


    });