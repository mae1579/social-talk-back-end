import mongoose from "mongoose";
import {MessageEntity} from "../types";


const MessageSchema = new mongoose.Schema<MessageEntity>({
    content: String,
    from: Object,
    socketid: String,
    time: String,
    date: String,
    to: String

});

export const mess = mongoose.model("Message", MessageSchema);