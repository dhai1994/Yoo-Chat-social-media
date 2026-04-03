import { useEffect, useRef } from "react";
import { useDispatch , useSelector} from "react-redux";
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
  reconnectionAttempts: Infinity,  // never give up
  reconnectionDelay: 1000,
  reconnectionDelayMax: 10000,     // max 10 sec between retries
  timeout: 20000,
  transports: ["websocket", "polling"], // fallback to polling if websocket fails
});
    SocketRef.current.on("reconnect", (attempt) => {
  // re-register the user after reconnecting
  const userId = // get your userId from redux store here
  if (userId) {
    SocketRef.current.emit("user", userId);
  }
});

SocketRef.current.on("reconnect_attempt", (attempt) => {
  console.log(`Reconnecting... attempt ${attempt}`);
});
    SocketRef.current.on("connect_error", (err) => {
  console.error("Socket connection error:", err.message);
});

    SocketRef?.current?.on("connect_error", (err) => {
      if (err?.data?.status == 405) {
        navigate("/");
      }
    });

    SocketRef?.current?.on("close_window", (new_id) => {
      if (SocketRef?.current.id !== new_id) {
        navigate('/close_tab')
      }
    });

    // for video / audio calls
    SocketRef?.current?.on("call user", (data) => {
      if (!isCall) {
        dispatch(addCall(data));

        if (data?.audio) {
          navigate("/audio-call")
        } else {
          navigate("/video-call")
        }
      }
    })

    SocketRef?.current?.on("call cancel", (data) => {
      dispatch(addEnded());
    })

    SocketRef?.current?.on("call attend", (data) => {
      dispatch(addAttend());
    })

    return () => {
      SocketRef?.current?.off("connect_error");

      SocketRef?.current?.off("close_window")

      // for video / audio calls
      SocketRef?.current?.off("call user")

      SocketRef?.current?.off("call cancel")

      SocketRef?.current?.off("call attend")

      SocketRef?.current?.disconnect?.();
    };
  }, [id]);

  return SocketRef.current;
};

export default useSocket;
