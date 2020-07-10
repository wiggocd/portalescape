const express = require('express');

const app = express();

app.get('/', (req, res) => {
  res
    .status(200)
    .send('This is the server for the <i><b>FunkoFox: Escape The Facility</b></i> game (c) Christian Wiggins. Please view <i><b><a href="info.txt">Info</a></b></i> now for the complete documentation of this project. <br><h3>Links:</h3><br><a href="newgame.html">New Game</a><br><a href="loadgame.html">Load Game</a><br><a href="tutorial.html">Tutorial</a><br><a href="info.txt">Info</a><br><a href="about.html">About</a><br><a href="https://bitbucket.org/wiggojr/animal_portal_escape/src/master/">Git</a><br><a href="https://apex-escape.appspot.com/">GCloud server</a></p>')
    .end();
});

app.use(express.static('game'))

// Start the server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
  console.log('Press Ctrl+C to quit.');
});