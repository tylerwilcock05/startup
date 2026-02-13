import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';

export default function App() {
    return (
      <div className="body bg-dark text-light">
        <header class="container-fluid custom-layout">
            <nav class="navbar fixed-top navbar-dark bg-dark">
                <div class="container-fluid">
                    <menu class="navbar-nav">
                        <li class="nav-item">
                        <a class="nav-link title-menu" href="play.html"><b>Cracked Typer</b></a></li>
                        <li class="nav-item">
                        <a class="nav-link" href="play.html">Play</a></li>
                        <li class="nav-item">
                        <a class="nav-link" href="my-stats.html">My Stats</a></li>
                        <li class="nav-item">
                        <a class="nav-link" href="my-friends.html">My Friends</a></li>
                        <li class="nav-item">
                        <a class="nav-link" href="leaderboard.html">Leaderboard</a></li>
                        <li class="nav-item push-right">
                        <a class="nav-link active" href="index.html">Login</a></li>
                    </menu>
                </div>
            </nav>
        </header>
  
        <main>App components go here</main>
  
        <footer class="bg-dark text-white-50 container-fluid py-3">
            <div class="container-fluid"> 
                <span class="text-reset">Tyler Wilcock</span>
                <button class="footer push-right">Change color scheme</button>
                <a class="text-reset" href="https://github.com/tylerwilcock05/startup">GitHub</a>
            </div>
    </footer>
      </div>
    );
  }