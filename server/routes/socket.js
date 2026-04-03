import chat from "../helper/private.js";
import group from "../helper/group.js";
import jwt from "jsonwebtoken";
import user from "../helper/user.js";
import { RoutePrivate, SocketPrivate } from "./private/index.js";
import { RouteGroup, SocketGroup } from "./group/index.js";
import RouteStories from './stories.js'

export default (app, io) => {

  io.use((socket, next) => {
    const { token = null } = socket?.request?.cookies;

    if (!token) {
      let error = new Error("user not logged");
      error.data = { status: 405, message: "user not logged" };
      return next(error);
    }

    jwt.verify(token, process.env.JWT_SECRET, async (err, decode) => {
      if (decode?._id?.length === 24) {
        try {
          let userData = await user.get_user(decode?._id);
          if (userData) {
            socket.userData = userData; // attach user to socket
            next();
          } else {
            let error = new Error("user not logged");
            error.data = { status: 405, message: "user not found" };
            next(error);
          }
        } catch (err) {
          next(); // don't block on DB error
        }
      } else {
        let error = new Error("user not logged");
        error.data = {
          status: 405,
          message: err ? err : "user not logged",
        };
        next(error);
      }
    });
  });

  io.on("connection", (socket) => {

    socket.on("user", async (_id) => {
      let previous = await chat?.addSocketId?.(_id, socket.id)?.catch?.(() => { });
      let groups = await group?.get_user_group_ids?.(_id)?.catch?.(() => { });

      if (previous?.socketId) {
        io.to(previous?.socketId).emit("close_window", socket.id);
      }

      if (groups?.[0]) {
        socket.join(groups);
      }

      io.emit("all user status", {
        _id: previous?._id?.toString?.()
      });
    });

    SocketPrivate(socket, io);
    SocketGroup(socket, io);

    socket.on("disconnect", async () => {
      let previous = await chat?.removeSocketId?.(socket.id)?.catch?.(() => { });

      io.emit("all user status", {
        _id: previous?._id?.toString?.(),
        offline: true
      });
    });
  });

  RoutePrivate(app, io);
  RouteGroup(app, io);
  RouteStories(app, io);
};
