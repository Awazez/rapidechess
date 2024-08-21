const express = require('express');
const { spawn } = require('child_process');

const app = express();
const port = 8080;

// Fonction pour envoyer une commande à Stockfish et lire la réponse
function sendCommandToStockfish(command, callback) {
    const stockfish = spawn('stockfish');
    
    let output = '';
    
    stockfish.stdout.on('data', (data) => {
        output += data.toString();
        if (output.includes('bestmove')) {
            stockfish.kill();
            callback(output);
        }
    });

    stockfish.stdin.write(command + '\n');
    stockfish.stdin.write('go movetime 1000\n');
}

// Route pour obtenir le meilleur coup
app.get('/bestmove', (req, res) => {
    const position = req.query.position;
    
    if (!position) {
        return res.status(400).send('Position parameter is required');
    }

    sendCommandToStockfish(`position fen ${position}`, (output) => {
        const bestMove = output.split('\n').find(line => line.startsWith('bestmove')).split(' ')[1];
        res.send(`Best move: ${bestMove}`);
    });
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
