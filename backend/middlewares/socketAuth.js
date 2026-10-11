const jwt = require("jsonwebtoken");
const Socket = require("socket.io");
const User = require("../models/User")

const socketAuth = async (socket, next) => {
    try {
        let token = socket.handshake?.auth?.token;
        if (!token) {
            return next(new Error("Not Authorized : no Token"))
        }
        if (token && token.startsWith("Bearer")) {
            token = token.split(" ")[1];

        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.id).select("_id name role");
        if (!user) {
            return next(new Error("Not Authoried: user not found"));
        }
        socket.data.user = {
            id: user._id.toString(),
            name: user.name,
            role: user.role
        };
        next()

    }
    catch (error) {
        next(new Error("Not Authorized: token failed", error));
    }


}

module.exports = { socketAuth };