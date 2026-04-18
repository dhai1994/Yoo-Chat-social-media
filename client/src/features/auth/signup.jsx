import React, { useEffect, useState, useRef } from "react";
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
  const cardRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [step, setStep] = useState(1); // 1 = info, 2 = otp
  const [state, setState] = useState({ form: {}, otp: false, error: undefined });

  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  const onMouseMove = (e) => {
    const r = cardRef.current?.getBoundingClientRect();
    if (!r) return;
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    setTilt({ x: dy * -6, y: dx * 6 });
  };
  const onMouseLeave = () => setTilt({ x: 0, y: 0 });

  const Google = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        const res = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${response?.access_token}` },
        });
        if (res?.["data"]) {
          setState((s) => ({
            ...s, error: undefined, otp: false,
            form: { ...s.form, email: res?.data?.email, name: res?.data?.name || "", google: response?.access_token },
          }));
        }
      } catch {
        setState((s) => ({ ...s, error: "Google sign-up failed" }));
      }
    },
    onError: () => setState((s) => ({ ...s, error: "Google sign-up failed" })),
    cookiePolicy: "single-host-origin",
  });

  const InputHandle = (e) => {
    e?.preventDefault?.();
    if (e?.target?.name === "email") setState((s) => ({ ...s, otp: false, form: { ...s.form, OTP: "", google: undefined } }));
    setState((s) => ({ ...s, form: { ...s.form, [e?.target?.name]: e?.target?.value } }));
  };

  const FormHandle = async (e, resend) => {
    e?.preventDefault?.();
    setState((s) => ({ ...s, error: undefined }));
    try {
      if (state?.otp && !resend) {
        const res = await instance.post("/user/register-verify", state?.form);
        if (res?.["data"]) navigate("/login");
      } else {
        setState((s) => ({ ...s, otp: { sent: resend } }));
        const res = await instance.post("/user/register", state?.form);
        if (res?.["data"]?.data?.otp) {
          setState((s) => ({ ...s, otp: { sent: true } }));
          setStep(2);
        } else if (res?.["data"]?.data?.google) {
          navigate("/login");
        }
      }
    } catch (err) {
      setState((s) => ({
        ...s,
        error: typeof err?.response?.data?.message === "string" ? err?.response?.data?.message : "Something went wrong",
        otp: s?.otp?.sent && { sent: true },
      }));
    }
  };

  useEffect(() => {
    document.title = "YooChat — Create Account";
    const t = setTimeout(() => dispatch(setLoading(false)), 1000);
    return () => clearTimeout(t);
  }, []);

  const features = [
    { icon: "⚡", title: "Instant Delivery", desc: "Messages in under 1ms" },
    { icon: "🔐", title: "End-to-End Encryption", desc: "Zero-knowledge privacy" },
    { icon: "🌍", title: "Global Infrastructure", desc: "Edge nodes worldwide" },
    { icon: "🎨", title: "Premium Experience", desc: "Designed for humans" },
  ];

  return (
    <div className={`fu-root ${mounted ? "fu-root--in" : ""}`}>
      <div className="fu-orb fu-orb--a" />
      <div className="fu-orb fu-orb--b" />
      <div className="fu-orb fu-orb--c" />
      <div className="fu-scanline" />

      <div className="fu-layout fu-layout--signup">
        {/* Left */}
        <div className="fu-left">
          <div className="fu-left__content">
            <div className="fu-brand">
              <div className="fu-brand__mark">
                <span>Y</span>
                <div className="fu-brand__ring" />
                <div className="fu-brand__ring fu-brand__ring--2" />
              </div>
              <span className="fu-brand__name">Yoo<em>Chat</em></span>
            </div>

            <h1 className="fu-hero">
              Start Your<br />
              <span className="fu-hero__hi">Journey.</span>
            </h1>

            <p className="fu-tagline">
              Join millions. Communicate better.<br />
              Free forever, no credit card.
            </p>

            <div className="fu-features">
              {features.map((f, i) => (
                <div className="fu-feature" key={i} style={{ animationDelay: `${0.3 + i * 0.12}s` }}>
                  <div className="fu-feature__icon">{f.icon}</div>
                  <div>
                    <div className="fu-feature__title">{f.title}</div>
                    <div className="fu-feature__desc">{f.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="fu-avatarrow">
              {["#4da3ff", "#a78bfa", "#34d399", "#fb923c", "#f472b6"].map((c, i) => (
                <div key={i} className="fu-avatar" style={{ background: c, marginLeft: i ? "-10px" : 0, zIndex: 5 - i }} />
              ))}
              <span>2.4M+ users connected</span>
            </div>
          </div>
        </div>

        {/* Right — Card */}
        <div className="fu-right">
          {/* Step indicator */}
          <div className="fu-steps">
            <div className={`fu-step ${step >= 1 ? "fu-step--active" : ""}`}>
              <div className="fu-step__dot">{step > 1 ? "✓" : "1"}</div>
              <span>Your Details</span>
            </div>
            <div className="fu-steps__line" />
            <div className={`fu-step ${step >= 2 ? "fu-step--active" : ""}`}>
              <div className="fu-step__dot">2</div>
              <span>Verify Email</span>
            </div>
          </div>

          <div
            ref={cardRef}
            className="fu-card"
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            style={{ transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(0)` }}
          >
            <div className="fu-card__topbar" />
            <div className="fu-card__corner fu-card__corner--tl" />
            <div className="fu-card__corner fu-card__corner--tr" />
            <div className="fu-card__glow" />

            <div className="fu-card__eyebrow">
              <span className="fu-ping" /><span>Free Account · No Card Needed</span>
            </div>

            <h2 className="fu-card__title">Create Account</h2>
            <p className="fu-card__sub">Join the conversation today</p>

            {state?.error && (
              <div className="fu-error">
                <span className="fu-error__ico">!</span>
                {state.error}
              </div>
            )}

            <button className="fu-google" type="button" onClick={Google}>
              <span className="fu-google__ico"><GoogleSvg width="17" height="17" /></span>
              <span>Continue with Google</span>
              <span className="fu-google__arr">→</span>
            </button>

            <div className="fu-sep"><span /><em>or register with email</em><span /></div>

            <form className="fu-form" onSubmit={FormHandle}>
              <div className="fu-form-grid">
                <div className="fu-field">
                  <Input name="name" placeholder="John Doe" label="Full Name" type="text" value={state.form.name || ""} onChange={InputHandle} required />
                </div>
                <div className="fu-field">
                  <Input name="number" placeholder="+91 98765 43210" label="Phone Number" type="number" value={state.form.number || ""} onChange={InputHandle} required />
                </div>
              </div>

              <div className="fu-field">
                <Input name="email" placeholder="hello@example.com" label="Email Address" type="email" value={state.form.email || ""} onChange={InputHandle} required />
              </div>

              {state?.otp ? (
                state.otp.sent ? (
                  <>
                    <div className="fu-otp-row">
                      <div className="fu-field" style={{ flex: 1 }}>
                        <Input name="OTP" placeholder="· · · · · ·" label="Verification Code" type="number" value={state.form.OTP || ""} onChange={InputHandle} required />
                      </div>
                      <button type="button" className="fu-resend" onClick={() => FormHandle(undefined, true)}>Resend</button>
                    </div>
                    <button className="fu-btn" type="submit"><span>Create Account</span><span className="fu-btn__shine" /></button>
                  </>
                ) : (
                  <button className="fu-btn fu-btn--load" disabled><span className="fu-spin" /><span>Sending code…</span></button>
                )
              ) : (
                <button className="fu-btn" type="submit"><span>Send OTP</span><span className="fu-btn__shine" /></button>
              )}
            </form>

            <div className="fu-footer">
              <span>Already have an account?</span>
              <Link to="/login" className="fu-link">Sign In →</Link>
            </div>

            <p className="fu-trust">🔒 256-bit SSL · SOC 2 Certified · GDPR Ready</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
