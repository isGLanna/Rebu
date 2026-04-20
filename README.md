# Orientações de Execução

Esse projeto segue uma linha de desenvolvimento com frontend baseado em react-native e o backend em Node.js. Este README está dividido em 3 seções principais. A primeira seção trata de como preparar o ambiente com as variáveis de ambiente utilizadas neste projeto. A seção seguinte define quais são os métodos para executar corretamente o projeto. A terceira seção detalha as ferramentas utilizadas neste projeto e como se adequam aos princípios de Sistemas Distribuídos foram implementados.

O processo pode ser demorado, portanto, foi configurado um script para executar um ou mais comandos de vez.

   ```bash
    ./main.sh
   ```

## Seção 1: Instalando Dependências

   ```bash
    ./create.sh
   ```

   ou

   ```bash
    cd backend
    npm install

    cd ../mobile
    npm install
   ```

## Seção 2: Executar projeto

Algumas funcionalidades podem ser restritas à versão mobile devido a falta de compatibilidade de alguns poucos recursos, embora a versão web  ainda permita visualizar o fluxo da aplicação. Entretanto, devido a complexidade até configurar o aplicativo no android/ios e a limitações de redes do campus, preferimos não abordar essa versão aqui.

  ```bash
    ./run.sh
  ```

  ou

   ```bash
    cd backend
    npm run dev

    cd ../mobile
    npx expo start --web
  ```

Obs: ocasionalmente, os processos podem não fechar corretamente, oculpando a porta utilizada enquanto o processo não for finalizado corretamente.

## Seção 3:

  - Ferramenta 1

  - Ferramenta 2