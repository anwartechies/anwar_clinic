import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';
import { Banner, Btn, Field } from '../components/ui';
import { useAuth } from '../auth';
import { errorText } from '../api';

export default function Login() {
  const { signIn, notice } = useAuth();
  const [identifier, setIdentifier] = useState(import.meta.env.DEV ? 'nilesh@nexgenhair.in' : '');
  const [password, setPassword] = useState(import.meta.env.DEV ? 'Nexgen@123' : '');
  const [remember, setRemember] = useState(true);
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError(null);
    try { await signIn(identifier.trim(), password, remember); } catch (err) { setError(errorText(err)); } finally { setBusy(false); }
  };

  return (
    <div className="login">
      <div className="art">
        <span className="blob" style={{ width: 520, height: 520, background: 'var(--cobalt)', top: -180, right: -200 }} />
        <span className="blob" style={{ width: 260, height: 260, background: 'var(--mint)', top: 200, right: -80 }} />
        <span className="blob" style={{ width: 160, height: 160, borderRadius: 44, background: 'var(--violet)', top: 60, left: -60, transform: 'rotate(18deg)' }} />
        <span className="blob" style={{ width: 70, height: 70, background: 'var(--amber)', top: 360, left: 90 }} />
        <span className="logo" style={{ width: 72, height: 72, borderRadius: 22, position: 'relative' }}><span style={{ fontSize: 38 }}>N</span></span>
        <div style={{ position: 'relative' }}>
          <div className="cap" style={{ color: 'var(--mint)' }}>Nexgen Hair Clinic</div>
          <div className="disp" style={{ fontWeight: 800, fontSize: 'clamp(40px, 5vw, 60px)', lineHeight: 0.95, marginTop: 8 }}>Nexgen<br />Inventory</div>
          <p style={{ color: '#C9D1EA', fontSize: 17, maxWidth: 380, marginTop: 14 }}>Every vial, kit and blade — counted, traced and accounted for.</p>
        </div>
      </div>
      <div className="form">
        <form onSubmit={submit}>
          <div><h1 className="h1">Admin console</h1><p className="sub" style={{ marginTop: 6 }}>Super Admin access only. Other roles use the mobile app.</p></div>
          {notice ? <Banner tone="amber">{notice}</Banner> : null}
          {error ? <Banner tone="coral">{error}</Banner> : null}
          <Field label="Work email or mobile">
            <div className="row" style={{ position: 'relative' }}><Mail size={16} color="var(--muted)" style={{ position: 'absolute', left: 12 }} /><input className="input" style={{ paddingLeft: 36 }} value={identifier} onChange={(e) => setIdentifier(e.target.value)} autoComplete="username" required /></div>
          </Field>
          <Field label="Password">
            <div className="row" style={{ position: 'relative' }}>
              <Lock size={16} color="var(--muted)" style={{ position: 'absolute', left: 12 }} />
              <input className="input" style={{ paddingLeft: 36, paddingRight: 40 }} type={show ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
              <button type="button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'} style={{ position: 'absolute', right: 8, border: 0, background: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 6 }}>{show ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
          </Field>
          <label className="row" style={{ gap: 10, fontSize: 13.5, color: 'var(--ink2)', cursor: 'pointer' }}><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} style={{ width: 18, height: 18 }} />Keep me signed in on this browser for 7 days</label>
          <Btn block disabled={busy} type="submit">{busy ? 'Signing in…' : 'Sign in'}</Btn>
          <div className="row sub" style={{ gap: 8, fontSize: 12 }}><ShieldCheck size={15} color="var(--mint-t)" />Every sign-in is audited. 5 failed attempts lock the account for 15 minutes.</div>
        </form>
      </div>
    </div>
  );
}
