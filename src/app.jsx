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
        <header class="container-fluid custom-layout">
            <nav class="navbar fixed-top navbar-dark bg-dark">
                <div class="container-fluid">
                    <menu class="navbar-nav">
                        <li class="nav-item">
                        <NavLink class="nav-link title-menu" to="play.html"><b>Cracked Typer</b></NavLink></li>
                        <li class="nav-item">
                        <NavLink class="nav-link" to="play.html">Play</NavLink></li>
                        <li class="nav-item">
                        <NavLink class="nav-link" to="my-stats.html">My Stats</NavLink></li>
                        <li class="nav-item">
                        <NavLink class="nav-link" to="my-friends.html">My Friends</NavLink></li>
                        <li class="nav-item">
                        <NavLink class="nav-link" to="leaderboard.html">Leaderboard</NavLink></li>
                        <li class="nav-item push-right">
                        <NavLink class="nav-link active" to="index.html">Login</NavLink></li>
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
  
        <footer class="bg-dark text-white-50 container-fluid py-3">
            <div class="container-fluid"> 
                <span class="text-reset">Tyler Wilcock</span>
                <button class="footer push-right">Change color scheme</button>
                <NavLink class="text-reset" to="https://github.com/tylerwilcock05/startup">GitHub</NavLink>
            </div>
    </footer>
      </div>
    );
  }