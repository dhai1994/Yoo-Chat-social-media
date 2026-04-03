import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";

const useSocket = (isCall) => {
  const SocketRef = useRef(null);
  const dispatch = useDispatch();
  const { id } = useParams();
  const navigate = useNavigate();
  const userId = useSelector((state) => state?.user?._id);

  useEffect(() => {
    SocketRef.current = io(import.meta.env.VITE_BACK_END, {
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
      timeout: 20000,
      transports: ["websocket", "polling"],
    });

    SocketRef.current.on("reconnect", () => {
      if (userId) {
        SocketRef.current.emit("user", userId);
      }
    });

    SocketRef.current.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
      if (err?.data?.status == 405) {
        navigate("/");
      }
    });

    SocketRef?.current?.on("close_window", (new_id) => {
      if (SocketRef?.current.id !== new_id) {
        navigate('/close_tab');
      }
    });

    SocketRef?.current?.on("call user", (data) => {
      if (!isCall) {
        dispatch(addCall(data));
        if (data?.audio) {
          navigate("/audio-call");
        } else {
          navigate("/video-call");
        }
      }
    });

    SocketRef?.current?.on("call cancel", () => {
      dispatch(addEnded());
    });

    SocketRef?.current?.on("call attend", () => {
      dispatch(addAttend());
    });

    return () => {
      SocketRef?.current?.off("connect_error");
      SocketRef?.current?.off("close_window");
      SocketRef?.current?.off("call user");
      SocketRef?.current?.off("call cancel");
      SocketRef?.current?.off("call attend");
      SocketRef?.current?.disconnect?.();
    };
  }, [id]);

  return SocketRef.current;
};

export default useSocket;
