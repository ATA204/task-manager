const userRoom = (userId) => `user:${userId}`;

const registerSocketHandlers = (io) => {
    io.on("connection", (socket) => {
        const { id, name } = socket.data.user

        socket.join(userRoom(id));
        console.log(`socket connected:${name} (${socket.id})`);

        socket.on("disconnect", (reason) => {
            console.log(`socket disconnected: ${name} (${reason})`)
        });
    });
};

module.exports = { userRoom, registerSocketHandlers };