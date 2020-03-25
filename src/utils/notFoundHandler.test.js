import Boom from "@hapi/boom";
import { Request, Response } from "jest-express";
import { notFoundHandler } from "./notFoundHandler";

describe("notFoundHandler", () => {
  it("should forward a 404 error using the next function", () => {
    const [req, res, next] = [new Request("/"), new Response(), jest.fn()];

    notFoundHandler(req, res, next);

    expect(next).toHaveBeenCalledWith(Boom.notFound("Cannot GET /"));
  });

  it("should use the current url for the error message", () => {
    const [req, res, next] = [new Request("/foo/bar"), new Response(), jest.fn()];

    notFoundHandler(req, res, next);

    expect(next).toHaveBeenCalledWith(Boom.notFound("Cannot GET /foo/bar"));
  });

  it("should use the current method for the error message", () => {
    const [req, res, next] = [new Request("/", { method: "POST" }), new Response(), jest.fn()];

    notFoundHandler(req, res, next);

    expect(next).toHaveBeenCalledWith(Boom.notFound("Cannot POST /"));
  });
});
