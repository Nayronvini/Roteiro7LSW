const partidasLista = document.getElementById('partidas-lista');
const tituloInput = document.getElementById('titulo');
const localInput = document.getElementById('local');
const dataInput = document.getElementById('data');
const horarioInput = document.getElementById('horario');
const criarPartidaButton = document.getElementById('criar-partida');

let partidas = [];

function renderizarPartidas() {
    partidasLista.innerHTML = ''; // Limpa a lista antes de renderizar

    partidas.forEach(partida => {
        let li = document.createElement('li');
        li.id = `partida-${partida.id}`;
        partidasLista.appendChild(li);

        // Atualiza o conteúdo do item da partida
        li.innerHTML = `
            <h3>${partida.titulo}</h3>
            <p>Local: ${partida.local}</p>
            <p>Data: ${partida.data}</p>
            <p>Horário: ${partida.horario}</p>
        `;

        // Lista de jogadores
        const jogadoresLista = document.createElement('ul');
        if (partida.jogadores) {
            partida.jogadores.forEach(jogador => {
                const jogadorLi = document.createElement('li');
                jogadorLi.textContent = `${jogador.nome} (${jogador.telefone}) ${jogador.confirmado ? '(Confirmado)' : ''}`;

                const removerButton = document.createElement('button');
                removerButton.textContent = 'Remover';
                removerButton.addEventListener('click', () => removerJogador(partida.id, jogador.id));

                const confirmarButton = document.createElement('button');
                confirmarButton.textContent = jogador.confirmado ? 'Desconfirmar Presença' : 'Confirmar Presença';
                confirmarButton.addEventListener('click', () => {
                    if (jogador.confirmado) {
                        desconfirmarJogador(partida.id, jogador.id);
                    } else {
                        confirmarJogador(partida.id, jogador.id);
                    }
                });

                jogadorLi.appendChild(removerButton);
                jogadorLi.appendChild(confirmarButton);
                jogadoresLista.appendChild(jogadorLi);
            });
        }
        li.appendChild(jogadoresLista);

        // Formulário para adicionar jogador
        const adicionarJogadorDiv = document.createElement('div');
        adicionarJogadorDiv.innerHTML = `
            <input type="text" id="nome-jogador-${partida.id}" placeholder="Nome">
            <input type="text" id="telefone-jogador-${partida.id}" placeholder="Telefone">
            <button id="adicionar-jogador-${partida.id}">Adicionar</button>
        `;
        li.appendChild(adicionarJogadorDiv);

        // Botão remover lista
        const removerListaButton = document.createElement('button');
        removerListaButton.textContent = 'Remover Lista';
        removerListaButton.addEventListener('click', () => apagarLista(partida.id));
        li.appendChild(removerListaButton);

        // Botão apagar partida
        const apagarPartidaButton = document.createElement('button');
        apagarPartidaButton.textContent = 'Apagar Partida';
        apagarPartidaButton.addEventListener('click', () => apagarPartida(partida.id));
        li.appendChild(apagarPartidaButton);

        // Adiciona listener para o botão "Adicionar"
        document.getElementById(`adicionar-jogador-${partida.id}`).addEventListener('click', () => {
            const nomeJogador = document.getElementById(`nome-jogador-${partida.id}`).value;
            const telefoneJogador = document.getElementById(`telefone-jogador-${partida.id}`).value;
            adicionarJogador(partida.id, nomeJogador, telefoneJogador);
        });
    });
}

function adicionarJogador(partidaId, nome, telefone) {
    fetch(`/partidas/${partidaId}/jogadores`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nome, telefone })
    })
    .then(response => response.json())
    .then(novoJogador => {
        const partida = partidas.find(p => p.id === partidaId);
        if (partida) {
            if (!partida.jogadores) {
                partida.jogadores = [];
            }
            partida.jogadores.push(novoJogador);
            renderizarPartidas();
        }
    });
}

function removerJogador(partidaId, jogadorId) {
    fetch(`/partidas/${partidaId}/jogadores/${jogadorId}`, {
        method: 'DELETE'
    })
    .then(() => {
        const partida = partidas.find(p => p.id === partidaId);
        if (partida) {
            partida.jogadores = partida.jogadores.filter(j => j.id !== jogadorId);
            renderizarPartidas();
        }
    });
}

function apagarLista(partidaId) {
    fetch(`/partidas/${partidaId}/jogadores`, {
        method: 'DELETE'
    })
    .then(() => {
        const partida = partidas.find(p => p.id === partidaId);
        if (partida) {
            partida.jogadores = [];
            renderizarPartidas();
        }
    });
}

function apagarPartida(partidaId) {
    fetch(`/partidas/${partidaId}`, {
        method: 'DELETE'
    })
    .then(() => {
        partidas = partidas.filter(p => p.id !== partidaId);
        renderizarPartidas();
    });
}

function carregarPartidas() {
    fetch('/partidas')
        .then(response => response.json())
        .then(data => {
            partidas = data;
            renderizarPartidas();
        });
}

criarPartidaButton.addEventListener('click', () => {
    const novaPartida = {
        id: Date.now(),
        titulo: tituloInput.value,
        local: localInput.value,
        data: dataInput.value,
        horario: horarioInput.value,
        jogadores: []
    };

    fetch('/partidas', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(novaPartida)
    })
    .then(response => response.json())
    .then(partida => {
        partidas.push(partida);
        renderizarPartidas();
        tituloInput.value = '';
        localInput.value = '';
        dataInput.value = '';
        horarioInput.value = '';
    });
});

function confirmarJogador(partidaId, jogadorId) {
    fetch(`/partidas/${partidaId}/jogadores/${jogadorId}/confirmar`, {
        method: 'PUT'
    })
    .then(() => {
        const partida = partidas.find(p => p.id === partidaId);
        if (partida) {
            const jogador = partida.jogadores.find(j => j.id === jogadorId);
            if (jogador) {
                jogador.confirmado = true;
                renderizarPartidas();
            }
        }
    });
}

function desconfirmarJogador(partidaId, jogadorId) {
    fetch(`/partidas/${partidaId}/jogadores/${jogadorId}/desconfirmar`, {
        method: 'PUT'
    })
    .then(() => {
        const partida = partidas.find(p => p.id === partidaId);
        if (partida) {
            const jogador = partida.jogadores.find(j => j.id === jogadorId);
            if (jogador) {
                jogador.confirmado = false;
                renderizarPartidas();
            }
        }
    });
}

carregarPartidas();