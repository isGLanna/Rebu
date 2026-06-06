## Início

Em suma, o diretório dos /scripts contém todas as instruções enumeradas sequencialmente para:

> 01. Buildar imagem, criar o cluster, carregar a imagem para o cluster e aplicar os recursos básicos (Ingress e Auto-scaler)

> 02. Aplicar os recusos de persistência de volumes (Redis e Postgres), os deployments e os serviços.

> 03. Aplicar os recursos do backend que precisam dos bancos de dados em execução para funcionarem.

Também, garanta que o Docker esteja aberto para criação e exposição da imagem, além do execução do kind.

Para bater na aplicação, a url de teste é:
> http://localhost:3001/health
