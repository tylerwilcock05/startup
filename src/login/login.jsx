import React from 'react';
import '../app.css';

export function Login() {
  return (
    <main className="login container-fluid bg-dark text-center">
      <h1>Welcome to Cracked Typer!</h1>
      <form method="get" action="play">
        <div className="input-group mb-3">
          <span className="input-group-text">@</span>
          <input className="form-control" type="text" placeholder="your@email.com" />
        </div>
        <div className="input-group mb-3">
          <span className="input-group-text">🔒</span>
          <input className="form-control" type="password" placeholder="password" />
        </div>
        <button type="submit" className="btn btn-primary">Login</button>
        <button type="submit" className="btn btn-secondary">Create</button>
      </form>
      </main>
    
  );
}

