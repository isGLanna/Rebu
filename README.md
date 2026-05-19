# Orientações de Execução

Esse projeto segue uma linha de desenvolvimento com frontend baseado em react-native e o backend em Node.js. Este README está dividido em 3 seções principais. A primeira seção trata de como preparar o ambiente com as variáveis de ambiente utilizadas neste projeto. A seção seguinte define quais são os métodos para executar corretamente o projeto. A terceira seção detalha as ferramentas utilizadas neste projeto para adequar aos princípios de Sistemas Distribuídos foram implementados.

O processo pode ser demorado, portanto, foi configurado um script para executar um ou mais comandos de vez.

   ```bash
    ./main.sh
   ```

## Seção 1: Instalando Dependências

Todas as variáveis de ambiente para o backend estão explicitas no docker-compose, quanto ao frontend, será necessário incluir um arquivo .env contendo a chave pública para acessar o mapa listado abaixo junto ao scripts de instalação das dependências:

EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN='pk.eyJ1IjoiZ2lvcmRhbm9sYW5uYSIsImEiOiJjbW8wdDV2NTcwYzlwMnhveTVja3htdTRzIn0.hNzDdxjqav0FBkeRIsag0w'

   ```bash
    ./create.sh
   ```

   ou

   ```bash
    cd backend
    docker compose up

    cd ../mobile
    docker compose up
   ```

## Seção 2: Executar projeto

Algumas funcionalidades podem ser restritas à versão mobile devido a falta de compatibilidade de alguns poucos recursos como a exibição de mapa, embora a versão web ainda permita visualizar o fluxo da aplicação. Também, a primeira inicialização do projeto pode ser consideravelmente demorada (30 - 40 minutos) para pré-compilar comandos não nativos do react-native, mas desejamos resolver expondo o projeto na nuvem. De toda forma, serão deixadas as séries de comandos para executar o backend e  ambas as versão do frontend em duas partes, o primeiro executa e disponibiliza a execução do frontend em web, o segundo deixará os passos para configurar e executa-lo em mobile.

### Backend

No diretório do Backend execute para subir o container:

  ```bash
    docker compose up
  ```

### Frontend - Web

No diretório do Frontend execute:

  ```bash
    npx expo start --web
  ```

  ou

  ```bash
    npx expo start
  ```

  ```bash
    w
  ```

### Frontend - Mobile

Desbloqueie o modo de desenvolvimento no celular e permita a depuração por USB ou Wifi. Após isso, execute o comando inserindo o seu sitema operacional (android/ios). Ao finalizar, abrirá o aplicativo automaticamente, caso não apareça, aperte 'a' ou 'i' para executar os comandos do Expo abrir em android ou ios.

  ```bash
    npx expo run:{Sistema Operacional}
  ```

## Seção 3:

  - Ferramenta 1

  - Ferramenta 2