/* 
importar as bibliotecas
importa routes

#inicializa o express
const app = express()

#define a porta padrão
const PORT = número maior que 1023

#Configura para o express entender JSON (objeto do JavaScript)
app.use(express.json())

#define os domínios permitidos (se não tiver parâmetros, permite todos os domínios)
app.use(cors())

# chama as rotas
app.use(routes)

#inicia o servidor

*/