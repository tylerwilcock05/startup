import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import { Login } from './login/login';
import { Play } from './play/play';
import { Leaderboard } from './leaderboard/leaderboard';
import { MyFriends } from './my-friends/my-friends';
import { MyStats } from './my-stats/my-stats';

export default function App() {
    return (
        <div className="body bg-dark text-light">
        <header className="container-fluid custom-layout">
          <nav className="navbar fixed-top navbar-dark bg-dark">
            <div className="container-fluid">
              <menu className="navbar-nav">
                <li className="nav-item">
                <NavLink className="nav-link title-menu" to="/play"><b>Cracked Typer</b></NavLink></li>
                <li className="nav-item">
                <NavLink className="nav-link" to="/play">Play</NavLink></li>
                <li className="nav-item">
                <NavLink className="nav-link" to="/stats">My Stats</NavLink></li>
                <li className="nav-item">
                <NavLink className="nav-link" to="/friends">My Friends</NavLink></li>
                <li className="nav-item">
                <NavLink className="nav-link" to="/leaderboard">Leaderboard</NavLink></li>
                <li className="nav-item push-right">
                <NavLink className="nav-link active" to="/">Login</NavLink></li>
              </menu>
            </div>
          </nav>
        </header>
  
        <Routes>
            <Route path='/' element={<Login />} exact />
            <Route path='/play' element={<Play />} />
            <Route path='/leaderboard' element={<Leaderboard />} />
            <Route path='/friends' element={<MyFriends />} />
            <Route path='/stats' element={<MyStats />} />
            <Route path='*' element={<NotFound />} />
        </Routes>
  
        <footer className="bg-dark text-white-50 container-fluid py-3">
            <div className="container-fluid"> 
                <span className="text-reset">Tyler Wilcock</span>
                <button className="footer push-right">Change color scheme</button>
                <NavLink className="text-reset" to="https://github.com/tylerwilcock05/startup">GitHub</NavLink>
            </div>
    </footer>
      </div>
    );
  }

  function NotFound() {
    return <main className="container-fluid bg-secondary text-center">404: Return to sender. Address unknown.</main>;
  }