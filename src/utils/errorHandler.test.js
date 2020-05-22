import Boom from "@hapi/boom";
import { Request, Response } from "jest-express";
import { errorHandler } from "./errorHandler";

describe("errorHandler", () => {
  it("should format Boom errors correctly", () => {
    const err = Boom.notFound("Test message");
    const [req, res, next] = [new Request(), new Response(), jest.fn()];

    errorHandler(err, req, res, next);

    expect(res.body).toEqual({
      error: "Not Found",
      statusCode: 404,
      message: "Test message",
    });
    expect(res.statusCode).toEqual(404);
  });

  it("should return a 500 error and format error when standard error is passed", () => {
    const err = new Error("Test message");
    const [req, res, next] = [new Request(), new Response(), jest.fn()];

    errorHandler(err, req, res, next);

    expect(res.body).toEqual({
      error: "Internal Server Error",
      statusCode: 500,
      message: "An internal server error occurred",
    });
    expect(res.statusCode).toEqual(500);
  });

  it("should continue if there is no error", () => {
    const err = undefined;
    const [req, res, next] = [new Request(), new Response(), jest.fn()];

    errorHandler(err, req, res, next);

    expect(next).toHaveBeenCalledWith();
  });
});
