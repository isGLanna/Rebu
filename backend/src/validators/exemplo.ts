  /*Validação de dados

  Os controladores são responsáveis por validar os dados de entrada e saída das rotas e prosseguir os dados para a regra
  de negócios (serviços). A principal ferramenta para isso é o Zod, uma biblioteca de validação de esquemas.

  Exemplo de uso:
*/
import { z } from 'zod'

const userSchema = z.object({~
  nome: z.string().max(100), age: z.number(),
  email: z.string().email().max(100),
  senha: z.string().min(4).max(32)
  tipoConta: z.enum(['driver', 'passenger'])    //--> Enum se refere a um conjunto de entradas previamente conhecidas
  dependente: z.object({
    nome: z.string().max(100),
    ...
  }).optional()    //--> Campo opcional
})

//Também é possível adicionar comentários para cada campo do schema
