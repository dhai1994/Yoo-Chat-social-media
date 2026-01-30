import React, { useEffect, useState } from "react";
import { Input } from "../../components";
import { GoogleSvg } from "../../assets";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setLoading } from "../../redux/additional";
import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { axios as instance } from "../../lib";
import "./style.scss";

const SignUp = () => {
  const dispatch = useDispatch();

  const navigate = useNavigate();

  const [state, setState] = useState({
    form: {},
    otp: false,
    error: undefined,
  });

  const Google = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const res = await axios.get(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: {
              Authorization: `Bearer ${response?.access_token}`,
            },
          }
        );

        if (res?.["data"]) {
          setState((state) => ({
            ...state,
            error: undefined,
            otp: false,
            form: {
              ...state.form,
              email: res?.data?.email,
              name: res?.data?.name || "",
              google: response?.access_token,
            },
          }));
        }
      } catch (err) {
        setState((state) => ({
          ...state,
          error: "Failing Google Sign Up",
        }));
      }
    },
    onError: (err) => {
      setState((state) => ({
        ...state,
        error: "Failing Google Sign Up",
      }));
    },
    cookiePolicy: "single-host-origin",
  });

  const FormHandle = async (e, resend) => {
    e?.preventDefault?.();
    setState((state) => ({
      ...state,
      error: undefined,
    }));

    try {
      if (state?.otp && !resend) {
        // verifying

        let res = await instance.post("/user/register-verify", state?.form);

        if (res?.["data"]) {
          navigate("/login");
        }
      } else {
        setState((state) => ({
          ...state,
          otp: {
            sent: resend
          }
        }))

        let res = await instance.post("/user/register", state?.form);

        if (res?.["data"]?.data?.otp) {
          setState((state) => ({
            ...state,
            otp: {
              sent: true
            },
          }));
        } else if (res?.["data"]?.data?.google) {
          navigate("/login");
        }
      }
    } catch (err) {
      setState((state) => ({
        ...state,
        error:
          typeof err?.response?.data?.message === "string"
            ? err?.response?.data?.message
            : "Something Went Wrong",
        otp: state?.otp?.sent && { sent: true }
      }));
    }
  };

  const InputHandle = (e) => {
    e?.preventDefault?.();

    if (e?.target?.name === "email") {
      setState((state) => ({
        ...state,
        otp: false,
        form: { ...state?.form, OTP: "", google: undefined },
      }));
    }

    setState((state) => ({
      ...state,
      form: { ...state?.form, [e?.target?.name]: e?.target?.value },
    }));
  };

  useEffect(() => {
    document.title = "Yoo Chat - Sign Up";

    const timer = setTimeout(() => {
      dispatch(setLoading(false));
    }, 1000);

    return () => {
      clearTimeout(timer);
    };
  }, []);
  return (
  <section className="auth">
    <div className="auth-container">
      <div className="auth-card">

        {/* BRAND */}
        <div className="auth-brand">
          <h1>Yoo<span>Chat</span></h1>
          <p>Connect to the digital world</p>
        </div>

        {/* TITLE */}
        <h2>Create Account</h2>

        {/* ERROR */}
        {state?.error && <p className="error">{state.error}</p>}

        {/* GOOGLE */}
        <button className="google-btn" onClick={Google} type="button">
          <GoogleSvg width="20" height="20" />
          Sign Up With Google
        </button>

        {/* DIVIDER */}
        <div className="auth-divider">
          <span>OR</span>
        </div>

        {/* FORM */}
        <form onSubmit={FormHandle}>
          <Input
            name="name"
            placeholder="Enter Name"
            label="Full Name*"
            type="text"
            value={state.form.name || ""}
            onChange={InputHandle}
            required
          />

          <Input
            name="email"
            placeholder="Enter Email"
            label="Email*"
            type="email"
            value={state.form.email || ""}
            onChange={InputHandle}
            required
          />

          <Input
            name="number"
            placeholder="Enter Number"
            label="Phone Number*"
            type="number"
            value={state.form.number || ""}
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

                <button className="auth-btn" type="submit">
                  Create Account
                </button>
              </>
            ) : (
              <button className="auth-btn" disabled>
                Sending…
              </button>
            )
          ) : (
            <button className="auth-btn" type="submit">
              Send OTP
            </button>
          )}
        </form>

        {/* FOOTER */}
        <div className="auth-footer">
          Already have an account?
          <Link to="/login"> Login</Link>
        </div>

      </div>
    </div>
  </section>
);

};

export default SignUp;
