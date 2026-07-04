# Orientações de Execução

Esse projeto segue uma linha de desenvolvimento com frontend baseado em react-native e o backend em Node.js. Este README está dividido em 3 seções principais. A primeira seção trata de como preparar o ambiente com as variáveis de ambiente utilizadas neste projeto. A seção seguinte define quais são os métodos para executar corretamente o projeto. A terceira seção detalha as ferramentas e mecanismos utilizadas neste projeto para adequar aos princípios de Sistemas Distribuídos que foram implementados. Caso deseje executar o projeto em instâncias kubernetes, utilize a sequencia de scripts presentes em infra/scripts na segunda seção (mobile não está incluso).

## Seção 1: Instalando Dependências

Todas as variáveis de ambiente para o backend estão explicitas no docker-compose e exemplo.env, quanto ao frontend, será necessário incluir um arquivo .env contendo a chave pública para acessar o mapa listado abaixo junto ao scripts de instalação das dependências, além de alterar os IPs contidos em:
   - backend/src/services/coreClient.js (IP do Core)
   - mobile/src/config/base-url.ts (IP do serviço)
   - backend/docker-compose.yaml em CORE_URL e SERVICE_URL (IP do Core e IP do serviço)

EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN='pk.eyJ1IjoiZ2lvcmRhbm9sYW5uYSIsImEiOiJjbW8wdDV2NTcwYzlwMnhveTVja3htdTRzIn0.hNzDdxjqav0FBkeRIsag0w'

Se desejar visualizar o desenvolvimento das interfaces mobile, garanta que seu dispositivo esteja no modo desenvolvedor e ativar a depuração por wifi. Além disso, ambos dispositivos devem estar conectados na mesma rede e pareados: configure o ip do seu dispositivo celular em Rebu/Mobile/connect_devices.sh, após isso, execute o seguinte código abaixo inserindo, respectivamente, porta virtual, código de segurança e porta real.

   ```bash
      ./connect_devices.sh
   ```

## Seção 2: Executar projeto

Algumas funcionalidades podem ser restritas à versão mobile devido a falta de compatibilidade de alguns poucos recursos como a exibição de mapa, embora a versão web ainda permita visualizar o fluxo da aplicação. Também, a primeira inicialização do projeto pode ser consideravelmente demorada (30 - 40 minutos) para pré-compilar comandos não nativos do react-native, mas desejamos resolver expondo o projeto na nuvem. De toda forma, serão deixadas as séries de comandos para executar o backend e  ambas as versão do frontend em duas partes, o primeiro executa e disponibiliza a execução do frontend em web, o segundo deixará os passos para configurar e executa-lo em mobile.

### Backend

No diretório do Backend execute para subir o container:

  ```bash
    docker compose up
  ```

### Frontend - Mobile

Desbloqueado o modo de desenvolvimento no celular e permitida a depuração por USB ou Wifi, crie as instâncias do container no docker executando o código:

   ```bash
    cd backend
    docker compose up

    cd ../mobile
    docker compose up      // Tenha paciência, vai demorar
   ```

   ou

   ```bash
    ./create.sh
   ```

Observação: ajuste o COMMAND dentro de docker-compose.yaml para o seu sistema operacional (android/ios). Ao finalizar, abrirá o aplicativo automaticamente, caso não apareça, aperte 'a' ou 'i' no terminal para executar os comandos do Expo abrir em android ou ios.

A fins de testes, é recomendada a inserção de usuários fictícios para atender às corridas, e portanto, execute o comando backend/popular_db.sh.

## Seção 3:

  - Ferramenta 1

  - Ferramenta 2
