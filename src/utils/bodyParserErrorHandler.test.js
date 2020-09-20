import Boom from "@hapi/boom";
import { Request, Response } from "jest-express";
import { bodyParserErrorHandler } from "./bodyParserErrorHandler";

describe("bodyParserErrorHandler", () => {
  it("should intercept `SyntaxError` errors and forward them as `Boom.badRequest`", () => {
    const err = new SyntaxError("Unexpected end of JSON input");
    const [req, res, next] = [new Request(), new Response(), jest.fn()];
    bodyParserErrorHandler(err, req, res, next);
    expect(next).toHaveBeenCalledWith(Boom.badRequest("Unexpected end of JSON input"));
  });

  it("should continue if the error is not a SyntaxError", () => {
    const err = new Error("Another error");
    const [req, res, next] = [new Request(), new Response(), jest.fn()];
    bodyParserErrorHandler(err, req, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });

  it("should continue if there is no error", () => {
    const err = undefined;
    const [req, res, next] = [new Request(), new Response(), jest.fn()];
    bodyParserErrorHandler(err, req, res, next);
    expect(next).toHaveBeenCalledWith();
  });
});
