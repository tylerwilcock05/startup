import React, { useRef } from 'react';
import '../app.css';

export function Login() {
  const usernameRef = useRef();

  // Store username in localStorage and redirect to play
  const handleSubmit = (e) => {
    e.preventDefault();
    const username = usernameRef.current.value.trim();
    if (username) {
      localStorage.setItem('ct-username', username);
      window.location.href = '/play';
    }
  };

  return (
    <main className="login container-fluid bg-dark text-center">
      <h1>Welcome to Cracked Typer!</h1>
      <form onSubmit={handleSubmit}>
        <div className="input-group mb-3">
          <span className="input-group-text">@</span>
          <input ref={usernameRef} className="form-control" type="text" placeholder="username" />
        </div>
        <div className="input-group mb-3">
          <span className="input-group-text">🔒</span>
          <input className="form-control" type="password" placeholder="password" />
        </div>
        <button type="submit" className="btn btn-primary">Login</button>
        <button type="button" className="btn btn-secondary" style={{marginLeft: '1em'}} onClick={handleSubmit}>Create</button>
      </form>
    </main>
  );
}

