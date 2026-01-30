import React, { useEffect, useState } from "react";
import { GoogleSvg } from "../../assets";
import { Input } from "../../components";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setLoading } from "../../redux/additional";
import { useGoogleLogin } from "@react-oauth/google";
import { axios } from "../../lib";
import "./style.scss";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [state, setState] = useState({
    form: {},
    otp: undefined,
    error: undefined,
  });

  const Google = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const res = await axios.get("/user/login-google", {
          params: { google: response?.access_token },
        });
        if (res?.data) navigate("/");
      } catch (err) {
        setState((s) => ({
          ...s,
          error:
            typeof err?.response?.data?.message === "string"
              ? err.response.data.message
              : "Failing Google Login",
        }));
      }
    },
    onError: () =>
      setState((s) => ({ ...s, error: "Failing Google Login" })),
  });

  const InputHandle = (e) => {
    if (e.target.name === "email") {
      setState((s) => ({
        ...s,
        form: { ...s.form, OTP: "" },
        otp: undefined,
      }));
    }
    setState((s) => ({
      ...s,
      form: { ...s.form, [e.target.name]: e.target.value },
    }));
  };

  const FormHandle = async (e, resend) => {
    e?.preventDefault?.();
    setState((s) => ({ ...s, error: undefined }));

    try {
      if (state?.otp && !resend) {
        const res = await axios.post("/user/login-verify", state.form);
        if (res?.data) navigate("/");
      } else {
        setState((s) => ({ ...s, otp: { sent: resend } }));
        const res = await axios.post("/user/login-otp", state.form);
        if (res?.data)
          setState((s) => ({ ...s, otp: { sent: true } }));
      }
    } catch (err) {
      setState((s) => ({
        ...s,
        error:
          typeof err?.response?.data?.message === "string"
            ? err.response.data.message
            : "Something Went Wrong",
        otp: s?.otp?.sent && { sent: true },
      }));
    }
  };

  useEffect(() => {
    document.title = "YooChat - Login";
    const timer = setTimeout(() => dispatch(setLoading(false)), 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="auth">
      <div className="auth-container">
        <div className="auth-card">

          <div className="auth-brand">
            <h1>Yoo<span>Chat</span></h1>
            <p>Connect to the digital world</p>
          </div>

          <h2>Welcome Back</h2>

          {state?.error && <p className="error">{state.error}</p>}

          <button className="google-btn" onClick={Google}>
            <GoogleSvg width="20" height="20" />
            Login With Google
          </button>

          <div className="auth-divider"><span>OR</span></div>

          <form onSubmit={FormHandle}>
            <Input
              name="email"
              placeholder="Enter Email"
              label="Email*"
              type="email"
              value={state.form.email || ""}
              onChange={InputHandle}
              required
            />

            {state?.otp ? (
              state.otp.sent ? (
                <>
                  <div className="otp">
                    <Input
                      name="OTP"
                      placeholder="Enter OTP"
                      label="OTP*"
                      type="number"
                      value={state.form.OTP || ""}
                      onChange={InputHandle}
                      required
                    />
                    <button
                      type="button"
                      className="resend"
                      onClick={() => FormHandle(undefined, true)}
                    >
                      Resend
                    </button>
                  </div>
                  <button className="auth-btn">Log In</button>
                </>
              ) : (
                <button className="auth-btn" disabled>Sending…</button>
              )
            ) : (
              <button className="auth-btn">Send OTP</button>
            )}
          </form>

          <div className="auth-footer">
            Don&apos;t have an account?
            <Link to="/signup"> SignUp</Link>
          </div>

        </div>
      </div>
    </section>
  );
};

export default Login;
