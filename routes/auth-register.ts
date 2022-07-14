import express from 'express';
import {model as User} from '../models/User'
import {ValidationError} from "../utils/handle-errors";
import bcrypt from "bcrypt";

export const registerRouter = express.Router();


registerRouter
    .post('/', async (req, res) => {

        if (!req.body.email || !req.body.password) {

            res
                .send('Nie uzupełniono wszystkich danych !')
                .status(404);


        }
        const saltRound = 10;
        if (await User.findOne({email: req.body.email})) {


            res
                .send('Użytkownik o takim e-mailu już istnieje !')
                .status(404);

        }

        const newUser = await new User({
            ...req.body,
            password: await bcrypt.hash(req.body.password, saltRound)
        })


        try {


            await newUser.save();
            res.send("Konto zostało utworzone :) ");
            res.status(200);


        } catch (err) {


            throw new ValidationError(`Nie udało się zarejestrować użytkownika, sprawdz czy wpisałeś poprawnie dane jak  password , email`);

        }


    });