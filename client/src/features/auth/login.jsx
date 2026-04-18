import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setLoading } from "../../redux/additional";
import { useGoogleLogin } from "@react-oauth/google";
import { axios } from "../../lib";
import { GoogleSvg } from "../../assets";
import { Input } from "../../components";
import "./style.scss";

const ParticleCanvas = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const pts = Array.from({ length: 80 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.4 + 0.3,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      o: Math.random() * 0.5 + 0.1,
    }));

    const streaks = Array.from({ length: 6 }, () => ({
      x: Math.random() * W, y: Math.random() * H - 300,
      len: Math.random() * 200 + 60,
      spd: Math.random() * 0.7 + 0.2,
      o: Math.random() * 0.15 + 0.03,
      ang: Math.random() * 0.25 - 0.12,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      streaks.forEach((s) => {
        s.y += s.spd;
        if (s.y > H + 400) { s.x = Math.random() * W; s.y = -400; }
        const g = ctx.createLinearGradient(s.x, s.y, s.x + Math.sin(s.ang) * s.len, s.y + s.len);
        g.addColorStop(0, `rgba(77,163,255,0)`);
        g.addColorStop(0.5, `rgba(100,190,255,${s.o})`);
        g.addColorStop(1, `rgba(77,163,255,0)`);
        ctx.save();
        ctx.strokeStyle = g;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x + Math.sin(s.ang) * s.len, s.y + s.len);
        ctx.stroke();
        ctx.restore();
      });

      pts.forEach((p, i) => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100,180,255,${p.o})`;
        ctx.fill();
        for (let j = i + 1; j < pts.length; j++) {
          const dx = pts[j].x - p.x, dy = pts[j].y - p.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 120) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(77,163,255,${0.07 * (1 - d / 120)})`;
            ctx.lineWidth = 0.4;
            ctx.stroke();
          }
        }
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    const onR = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; };
    window.addEventListener("resize", onR);
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", onR); };
  }, []);
  return <canvas ref={canvasRef} className="fu-canvas" />;
};

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cardRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [state, setState] = useState({ form: {}, otp: undefined, error: undefined });

  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  const onMouseMove = (e) => {
    const r = cardRef.current?.getBoundingClientRect();
    if (!r) return;
    const dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
    const dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
    setTilt({ x: dy * -7, y: dx * 7 });
  };
  const onMouseLeave = () => setTilt({ x: 0, y: 0 });

  const Google = useGoogleLogin({
    onSuccess: async (res) => {
      try {
        const r = await axios.get("/user/login-google", { params: { google: res?.access_token } });
        if (r?.data) navigate("/");
      } catch (err) {
        setState((s) => ({ ...s, error: typeof err?.response?.data?.message === "string" ? err.response.data.message : "Google login failed" }));
      }
    },
    onError: () => setState((s) => ({ ...s, error: "Google login failed" })),
  });

  const InputHandle = (e) => {
    if (e.target.name === "email") setState((s) => ({ ...s, form: { ...s.form, OTP: "" }, otp: undefined }));
    setState((s) => ({ ...s, form: { ...s.form, [e.target.name]: e.target.value } }));
  };

  const FormHandle = async (e, resend) => {
    e?.preventDefault?.();
    setState((s) => ({ ...s, error: undefined }));
    try {
      if (state?.otp && !resend) {
        const r = await axios.post("/user/login-verify", state.form);
        if (r?.data) navigate("/");
      } else {
        setState((s) => ({ ...s, otp: { sent: resend } }));
        const r = await axios.post("/user/login-otp", state.form);
        if (r?.data) setState((s) => ({ ...s, otp: { sent: true } }));
      }
    } catch (err) {
      setState((s) => ({
        ...s,
        error: typeof err?.response?.data?.message === "string" ? err.response.data.message : "Something went wrong",
        otp: s?.otp?.sent && { sent: true },
      }));
    }
  };

  useEffect(() => {
    document.title = "YooChat — Welcome Back";
    const t = setTimeout(() => dispatch(setLoading(false)), 1000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`fu-root ${mounted ? "fu-root--in" : ""}`}>
      <ParticleCanvas />
      <div className="fu-orb fu-orb--a" />
      <div className="fu-orb fu-orb--b" />
      <div className="fu-orb fu-orb--c" />
      <div className="fu-scanline" />

      <div className="fu-layout">
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
              Enter<br />
              <span className="fu-hero__hi">the Future.</span>
            </h1>

            <p className="fu-tagline">
              Real-time · Encrypted · Beautifully fast.<br />
              Every conversation matters.
            </p>

            <div className="fu-metrics">
              {[{ v: "2.4M+", l: "Active Users" }, { v: "99.9%", l: "Uptime" }, { v: "<1ms", l: "Latency" }].map((m, i) => (
                <div className="fu-metric" key={i} style={{ animationDelay: `${0.5 + i * 0.15}s` }}>
                  <div className="fu-metric__val">{m.v}</div>
                  <div className="fu-metric__label">{m.l}</div>
                </div>
              ))}
            </div>

            {/* Abstract 3D orb visual */}
            <div className="fu-sphere">
              <div className="fu-sphere__core" />
              {[1, 2, 3].map((n) => (
                <div key={n} className={`fu-sphere__ring fu-sphere__ring--${n}`} />
              ))}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((deg, i) => (
                <div
                  key={i}
                  className="fu-sphere__dot"
                  style={{ "--r": "90px", "--deg": `${deg}deg`, animationDelay: `${i * 0.2}s` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right — Card */}
        <div className="fu-right">
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
              <span className="fu-ping" /><span>Secure · Encrypted</span>
            </div>

            <h2 className="fu-card__title">Welcome Back</h2>
            <p className="fu-card__sub">Sign in to continue your journey</p>

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

            <div className="fu-sep"><span /><em>or sign in with email</em><span /></div>

            <form className="fu-form" onSubmit={FormHandle}>
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
                    <button className="fu-btn" type="submit"><span>Log In</span><span className="fu-btn__shine" /></button>
                  </>
                ) : (
                  <button className="fu-btn fu-btn--load" disabled><span className="fu-spin" /><span>Sending…</span></button>
                )
              ) : (
                <button className="fu-btn" type="submit"><span>Send OTP</span><span className="fu-btn__shine" /></button>
              )}
            </form>

            <div className="fu-footer">
              <span>No account yet?</span>
              <Link to="/signup" className="fu-link">Create one →</Link>
            </div>

            <p className="fu-trust">🔒 256-bit SSL · SOC 2 Certified · GDPR Ready</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
