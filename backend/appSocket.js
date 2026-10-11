const { Server } = require("socket.io");
const { socketAuth } = require("./middlewares/socketAuth");
const { registerSocketHandlers } = require("./controllers/socketController");

let io = null;

const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || "*",
            methods: ["POST", "GET"],
        },
    });
    io.use(socketAuth);  //El-connection by(auth first)
    registerSocketHandlers(io) //rooms
    return io;
};

const getIO = () => io;

module.exports = { initSocket, getIO }