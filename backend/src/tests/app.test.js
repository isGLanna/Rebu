const request = require("supertest");
const app = require("../app");

// Testa se a API principal está rodando
describe("API Rebu", () => {
  test("deve retornar mensagem inicial da API", async () => {
    const resposta = await request(app).get("/");

    expect(resposta.statusCode).toBe(200);
    expect(resposta.body.mensagem).toBe("Backend Rebu rodando!");
  });
});