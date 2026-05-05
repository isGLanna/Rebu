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
    | lat, lng     |  Dado  | Posição atual do usuário calculada antes para melhorar resposta            |
    |startingPoint |  Dado  | Ponto de partida                                                           |
    |changedStar...|  Dado  | Se o ponto de partida for mudado, indica-lo e tratar como marcador         |
    |markers       |  Dado  | Contém pontos de parada e/ou partida, caso o mude, para o índice 0         |
    |   *****      | Trigger| Verifica se usuário tem corrida ativa                                      |
    | newMarker    | Método | Insere nova marcação limitando a 3 pontos                                  |

### Confirmação de Corrida