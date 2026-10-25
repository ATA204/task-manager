const { Server } = require("socket.io");
const { socketAuth } = require("./middlewares/socketAuth");
const { registerSocketHandlers } = require("./controllers/socketController");
const { getCorsOrigin } = require("./config/cors");

let io = null;

const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: getCorsOrigin(), // same CLIENT_URL list as the REST API
            methods: ["POST", "GET"],
        },
    });
    io.use(socketAuth);  //El-connection by(auth first)
    registerSocketHandlers(io) //rooms
    return io;
};

const getIO = () => io;

module.exports = { initSocket, getIO }