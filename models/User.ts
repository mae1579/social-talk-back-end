import mongoose from "mongoose";
import {User} from "../types";
import isEmail from "validator/lib/isEmail";


const UserSchema = new mongoose.Schema<User>({
    name: {
        type: String,
        required: true,
        min: 3,
        max: 20,

    },
    email: {
        type: String,
        required: true,
        max: 50,
        unique: true,
        index: true,
        validate: isEmail

    },
    password: {
        type: String,
        required: true,
        min: 6,
    },
    picture: {
        type: String,
    },
    newMessages: {
        type: Object,
        default: {}
    },
    status: {
        type: String,
        default: 'online'
    },

}, {minimize: false});

export const model = mongoose.model("User", UserSchema);