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

// Testa a listagem de usuários
describe("Rotas de usuários", () => {
  test("deve listar usuários", async () => {
    const resposta = await request(app).get("/usuarios");

    expect(resposta.statusCode).toBe(200);
    expect(Array.isArray(resposta.body)).toBe(true);
  });
});

// Testa a listagem de corridas
describe("Rotas de corridas", () => {
  test("deve listar corridas", async () => {
    const resposta = await request(app).get("/corridas");

    expect(resposta.statusCode).toBe(200);
    expect(Array.isArray(resposta.body)).toBe(true);
  });
});