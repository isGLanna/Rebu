# Simplificando Backend

  Backend possui três diretórios fundamentais que eventualmente podem utilizar de outros, caso necessário. Portanto, será explicado
a função de cada um abaixo:

index.tsx -> Routes -> Controllers -> Services

### index.ts ou main.ts

  Arquivo que inicializa, reconhece as rotas e as disponibiliza para clientes consumirem. Pode possuir funções intermediárias(middlewares)
para tratar informações como permissão para acessar uma rota verificando a role do usuário (driver/passenger) ou verificar quantas vezes o usuário solicita algo. Aqui será dada a porta de comunicação (IP:Porta -> 168.0...:3000 ou http://localhost:3000), protocolos de redes (http).

  Para configurar, devem ser usadas as bibliotecas Express para estabelecer a conexão, dotenv(arquivo .env) para acessar variáveis que não podem ser expostas e 
cors para habilitar conexão via lista de controle (ACL).

### Routes

  Cria e disponibiliza rotas para acessar chamando o objeto dos controladores com o seu método que será usado em cada uma das rotas. Um
arquivo pode ser apenas para registros e outro apenas para funções de um usuário (consulte meus dados, crie meus dados, solicite corrida, ...)

### Controllers

  Controlam para onde vão os dados, respondem se a requisição foi feita com sucesso, retornam o corpo(body) da requisição, caso precise
retornar dados, e se os dados são válidos para aquele serviço.

### Services

  Aplicam a regra de negócio inserindo usuários nas tabelas, calculando preços, aplicando taxas, removendo usuários, .... Para consultas, utilize a biblioteca 
Pool(node-postgres) para permitir operações CRUD. A biblioteca é curta e simples, provavelmente as seções `feature` -> Connecting, Queries, e Transactions contém boa parte do conteúdo necessário.