const pool = require("../config/db")

/**
 * A função transaction é um decorador que envolve o método recebido por parâmetro em uma transação de banco de dados. Ela armazena o estado inicial, executa o método e, caso retorno positivo, confirma a operação. Entretanto,
 * se houver erro em uma das operações do banco de dados, é realizado o rollback para prevenir a integridade dos dados.
 * @param {*} target: contém o objeto da classe onde a função decorada está localizada. É possível acessar as propriedades e métodos da classe através do target.
 * @param {*} propertyKey: é o nome da função decorada 
 * @param {*} descriptor: é um objeto que contém informações sobre a função decorada, a função original é interpretada como parâmetro(callback) e é possível acessar os argumentos e manipulá-los antes ou depois da execução
 * @returns generic type: o decorador retorna o mesmo tipo contido pela função, portanto, o tipo de retorno da própria função decorada é mantida.
 */
export function transaction(target, propertyKey, descriptor) {
  const callback = descriptor.value

  descriptor.value = async function (...args) {
    const client = await pool.connect()
    try {
      client.query("BEGIN")

      const result = await callback.apply(this, args)

      client.query("COMMIT")

      return result
    } catch (error) {
      client.query("ROLLBACK")
      throw error
    } finally {
      client.release()
    }
  }

  return descriptor
}