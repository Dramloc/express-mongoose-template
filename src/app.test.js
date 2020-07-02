import request from "supertest";
import app from "./app";

describe("POST /", () => {
  it("should respond with 422 if the JSON payload is invalid", async () => {
    const response = await request(app).post("/").set("Content-Type", "application/json").send("{");
    expect(response.status).toBe(422);
    expect(response.body).toStrictEqual({
      statusCode: 422,
      error: "Unprocessable Entity",
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
