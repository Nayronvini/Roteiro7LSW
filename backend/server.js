const express = require('express');
const fs = require('fs').promises;
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('../frontend'));

const partidasFilePath = 'partidas.json';

// Função para ler o JSON (assíncrona)
async function readPartidas() {
    try {
        const data = await fs.readFile(partidasFilePath, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
}

// Função para escrever no JSON (assíncrona)
async function writePartidas(partidas) {
    await fs.writeFile(partidasFilePath, JSON.stringify(partidas, null, 2));
}

// Criar uma nova partida
app.post('/partidas', async (req, res) => {
    const novaPartida = req.body;
    novaPartida.id = uuidv4(); // Gera UUID
    novaPartida.jogadores = [];
    const partidas = await readPartidas();
    partidas.push(novaPartida);
    await writePartidas(partidas);
    res.json(novaPartida);
});

// Buscar todas as partidas
app.get('/partidas', async (req, res) => {
    const partidas = await readPartidas();
    res.json(partidas);
});

// Adicionar um jogador a uma partida
app.post('/partidas/:id/jogadores', async (req, res) => {
    const partidaId = req.params.id;
    const novoJogador = req.body;
    novoJogador.id = uuidv4(); // Gera UUID
    novoJogador.confirmado = false; // Adiciona o campo "confirmado"
    const partidas = await readPartidas();
    const partida = partidas.find(p => p.id === partidaId);

    if (partida) {
        partida.jogadores.push(novoJogador);
        await writePartidas(partidas);
        res.json(novoJogador);
    } else {
        res.status(404).send({ error: 'Partida não encontrada' });
    }
});

// Remover um jogador específico de uma partida
app.delete('/partidas/:id/jogadores/:jogadorId', async (req, res) => {
    const partidaId = req.params.id;
    const jogadorId = req.params.jogadorId;
    let partidas = await readPartidas();

    const partidaIndex = partidas.findIndex(p => p.id === partidaId);
    if (partidaIndex === -1) {
        return res.status(404).send({ error: 'Partida não encontrada' });
    }

    const jogadorIndex = partidas[partidaIndex].jogadores.findIndex(j => j.id === jogadorId);
    if (jogadorIndex === -1) {
        return res.status(404).send({ error: 'Jogador não encontrado' });
    }

    // Remove o jogador do array
    partidas[partidaIndex].jogadores.splice(jogadorIndex, 1);
    await writePartidas(partidas);

    res.send({ message: 'Jogador removido com sucesso' });
});

// Apagar todos os jogadores de uma partida
app.delete('/partidas/:id/jogadores', async (req, res) => {
    const partidaId = req.params.id;
    let partidas = await readPartidas();

    const partidaIndex = partidas.findIndex(p => p.id === partidaId);
    if (partidaIndex === -1) {
        return res.status(404).send({ error: 'Partida não encontrada' });
    }

    // Esvaziar a lista de jogadores
    partidas[partidaIndex].jogadores = [];
    await writePartidas(partidas);

    res.send({ message: 'Lista de jogadores apagada' });
});

// Confirmar presença de um jogador
app.put('/partidas/:id/jogadores/:jogadorId/confirmar', async (req, res) => {
    const partidaId = req.params.id;
    const jogadorId = req.params.jogadorId;
    let partidas = await readPartidas();

    const partidaIndex = partidas.findIndex(p => p.id === partidaId);
    if (partidaIndex === -1) {
        return res.status(404).send({ error: 'Partida não encontrada' });
    }

    const jogadorIndex = partidas[partidaIndex].jogadores.findIndex(j => j.id === jogadorId);
    if (jogadorIndex === -1) {
        return res.status(404).send({ error: 'Jogador não encontrado' });
    }

    partidas[partidaIndex].jogadores[jogadorIndex].confirmado = true;
    await writePartidas(partidas);

    res.send({ message: 'Jogador confirmado' });
});

// Desconfirmar presença de um jogador
app.put('/partidas/:id/jogadores/:jogadorId/desconfirmar', async (req, res) => {
    const partidaId = req.params.id;
    const jogadorId = req.params.jogadorId;
    let partidas = await readPartidas();

    const partidaIndex = partidas.findIndex(p => p.id === partidaId);
    if (partidaIndex === -1) {
        return res.status(404).send({ error: 'Partida não encontrada' });
    }

    const jogadorIndex = partidas[partidaIndex].jogadores.findIndex(j => j.id === jogadorId);
    if (jogadorIndex === -1) {
        return res.status(404).send({ error: 'Jogador não encontrado' });
    }

    partidas[partidaIndex].jogadores[jogadorIndex].confirmado = false;
    await writePartidas(partidas);

    res.send({ message: 'Jogador desconfirmado' });
});

// Apagar uma partida específica
app.delete('/partidas/:id', async (req, res) => {
    const partidaId = req.params.id;
    let partidas = await readPartidas();

    const partidaIndex = partidas.findIndex(p => p.id === partidaId);
    if (partidaIndex === -1) {
        return res.status(404).send({ error: 'Partida não encontrada' });
    }

    // Remove a partida do array
    partidas.splice(partidaIndex, 1);
    await writePartidas(partidas);

    res.send({ message: 'Partida apagada com sucesso' });
});

app.listen(port, () => {
    console.log(`Servidor rodando em http://localhost:${port}`);
});