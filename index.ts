import express from 'express';
import 'express-async-errors';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import helmet from "helmet";
import rateLimiter from 'express-rate-limit';
import {handleError} from "./utils/handle-errors";
import mongoose from "mongoose";
//Modele mongodbAtlas:
import {mess as Message} from "./models/Message";
import {model as User} from './models/User';
//Ruty weryfikacji :
import {loginRouter} from "./routes/auth-login";
import {registerRouter} from "./routes/auth-register";


const app = express();

dotenv.config({path: '.env'});

mongoose.connect(process.env.MONGO_URL, () => {

    console.log('MONGO DB IS CONNECTED');
});
app.use(cors(
));
app.use(express.json());
app.use(morgan('common'));
app.use(helmet());
app.use(express.urlencoded({extended: true}));
app.use(rateLimiter({
    windowMs: 5 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
}));

// socket io utworzenie pokojów;
const rooms = ['Ogólny', 'Sport', 'Informatyka', 'Kryptowaluty'];
const server = require('http').createServer(app);
const PORT = 8080;
const io = require('socket.io')(server, {

    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST']
    }

});


app.get('/rooms', (req, res) => {
    res.json(rooms);

})

// Dodanie Daty do wiadomosci:
const lastMessage = async (room: any) => {
    let roomMessages = await Message.aggregate([
        {$match: {to: room}},
        {$group: {_id: '$date', messagesByDate: {$push: '$$ROOT'}}}

    ])
    return roomMessages;


}

const sortMessagesByDate = (messages: any) => {

    return messages.sort((a: any, b: any) => {

        let date1 = a._id.split('/');
        let date2 = b._id.split('/');

        date1 = date1[2] + date1[0] + date1[1];
        date2 = date2[2] + date2[0] + date2[1];

        return date1 < date2 ? -1 : 1;


    })

}


// socket.io nowy uzytkownik , dolaczenie do pokoju rozmow.
io.on('connection', (socket: any) => {

    socket.on('new-user', async () => {
        const members = await User.find();
        io.emit('new-user', members)

    })

    socket.on('join-room', async (room: any) => {

        socket.join(room);
        let roomMessages = await lastMessage(room);
        roomMessages = sortMessagesByDate(roomMessages);
        socket.emit('room-messages', roomMessages)


    })

    socket.on('message-room', async (room: any, content: any, sender: any, time: any, date: any) => {

        const newMessage = await Message.create({content, from: sender, time, date, to: room});
        let roomMessages = await lastMessage(room);
        roomMessages = sortMessagesByDate(roomMessages);

        //Wysylanie wiadomosci do pokoju :

        io.to(room).emit('room-messages', roomMessages);

        socket.broadcast.emit('notifications', room)


    })

// Sesja do wylogowywania :
    app.delete('/logout', async (req, res) => {

        try {

            const {_id, newMessages} = req.body;
            const user = await User.findById(_id);
            user.status = "offline";
            user.newMessages = newMessages;
            await user.save();
            const members = await User.find();
            socket.broadcast.emit('new-user', members);
            res.status(200).send();


        } catch (e) {

            console.log(e);
            res
                .status(400)
                .send();

        }


    })


})


app.use('/auth/login', loginRouter);
app.use('/auth/register', registerRouter);
app.use(handleError);


server.listen(PORT, "0.0.0.0", () => {
    console.log('listening to port ', PORT);

});

