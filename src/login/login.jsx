import React, { useEffect, useState } from 'react';
import '../app.css';

export function Login(props) {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [displayError, setDisplayError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/auth/me', { method: 'get', credentials: 'include' })
      .then(async (response) => {
        if (response?.status !== 200) {
          return;
        }
        const body = await response.json().catch(() => ({}));
        if (cancelled) return;
        if (body?.email) {
          setUserName(body.email);
        }
        setIsLoggedIn(true);
      })
      .catch(() => {
        // Not logged in or offline
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function loginOrCreate(endpoint, e) {
    e?.preventDefault();
    setDisplayError('');

    const response = await fetch(endpoint, {
      method: 'post',
      credentials: 'include',
      body: JSON.stringify({ email: userName, password: password }),
      headers: {
        'Content-type': 'application/json; charset=UTF-8',
      },
    });

    if (response?.status === 200) {
      setIsLoggedIn(true);
      props?.onLogin?.(userName);
      window.location.href = '/play';
    } else {
      const body = await response.json().catch(() => ({ msg: 'Login failed' }));
      setDisplayError(`⚠ Error: ${body.msg}`);
    }
  }

  function logout() {
    fetch(`/api/auth/logout`, {
      method: 'delete',
      credentials: 'include',
    })
      .catch(() => {
        // Logout failed. Assuming offline
      })
      .finally(() => {
        props?.onLogout?.();
        setIsLoggedIn(false);
        setUserName('');
        setPassword('');
      });
  }

  return (
    <main className="login container-fluid bg-dark text-center">
      <h1>Welcome to Cracked Typer!</h1>
      {isLoggedIn ? (
        <div>
          <p>Signed in as <b>{userName}</b></p>
          <button type="button" className="btn btn-secondary" onClick={logout}>Logout</button>
        </div>
      ) : (
        <form onSubmit={(e) => loginOrCreate('/api/auth/login', e)}>
          <div className="input-group mb-3">
            <span className="input-group-text">@</span>
            <input
              className="form-control"
              type="text"
              placeholder="email"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>
          <div className="input-group mb-3">
            <span className="input-group-text">🔒</span>
            <input
              className="form-control"
              type="password"
              placeholder="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {displayError && <div className="text-warning mb-2">{displayError}</div>}
          <button type="submit" className="btn btn-primary">Login</button>
          <button
            type="button"
            className="btn btn-secondary"
            style={{ marginLeft: '1em' }}
            onClick={(e) => loginOrCreate('/api/auth/create', e)}
          >
            Create
          </button>
        </form>
      )}
    </main>
  );
}
