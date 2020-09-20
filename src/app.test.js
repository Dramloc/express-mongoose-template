import request from "supertest";
import app from "./app";

describe("POST /", () => {
  it("should respond with 400 if the JSON payload is invalid", async () => {
    const response = await request(app).post("/").set("Content-Type", "application/json").send("{");
    expect(response.status).toBe(400);
    expect(response.body).toStrictEqual({
      statusCode: 400,
      error: "Bad Request",
      message: "Unexpected end of JSON input",
    });
  });
});

describe("GET /should-not-exist", () => {
  it("should respond with 404", async () => {
    const response = await request(app).get("/should-not-exist");
    expect(response.status).toBe(404);
    expect(response.body).toStrictEqual({
      statusCode: 404,
      error: "Not Found",
      message: "Cannot GET /should-not-exist",
    });
  });
});
