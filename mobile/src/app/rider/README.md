# Fluxo da Aplicação

Em partes, alguns fragmentos de código apresentaram expressiva complexidade tornando a interpretação e manutenção difíceis de manter. Entretanto, a gerência de estados ao longo das etapas da corrida (navigation-map.tsx) são obrigatórias, logo, nada mais necessário que o código e a lógica estarem certos e por isso será mantido assim. Abaixo está uma explicação razoável do funcionamento:

### Navegação e Seleção de Paradas

    |      Nome       |  Tipo  |          Função                                                            |
    |-----------------|--------|----------------------------------------------------------------------------|
    | lat, lng        |  Dado  | Posição atual do usuário calculada antes para melhorar resposta            |
    |startingPoint    |  Dado  | Ponto de partida                                                           |
    |changedStartingPo|  Dado  | Indica se o ponto de partida foi ou será alterado para o primeiro marcador |
    |markers          |  Dado  | Contém pontos de parada e/ou partida, caso o mude, para o índice 0         |
    |   *****         | Trigger| Verifica se usuário tem corrida ativa                                      |
    | newMarker       | Método | Insere nova marcação limitando a 3 pontos                                  |

### Geração de Rota e Busca por Motorista

    |    Nome      |  Tipo  |          Função                                                            |
    |--------------|--------|----------------------------------------------------------------------------|
    |isSearchingDri|  Dado  | Indica procura por motorsitas (abre o modal e bloqueia novos marcadores)   |
    |pendingTrip   |  Dado  | Recebe conjunto coordenadas da rota e o custo da corrida                   |
    |activeTrip    |  Dado  | Recebe nome, avaliação e carro do motorista ofertado                       |
    |RequestRace   | Método | Solicita motorista, traçado da rota e custo                                |
    |RequestNewDriv| Método | Solicita outro motorista                                                   |
    |CancelSearchRa| Método | Cancela a corrida (abaixar o modal também o ativa)                         |
    |AcceptRace    | Método | Envia confirmação da corrida (recebe posição do motorista)                 |

### Confirmação de Corrida

    |    Nome      |  Tipo  |          Função                                                            |
    |--------------|--------|----------------------------------------------------------------------------|
    |selectedDriver|  Dado  | Recebe informações do motorista e sua posição atual                        |
    |isRaceAccepted| Método | Indica corrida ativa e bloqueia novas corridas enquanto não finalizar      |