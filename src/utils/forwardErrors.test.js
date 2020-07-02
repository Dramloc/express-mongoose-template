import { Request, Response } from "jest-express";
import { forwardErrors } from "./forwardErrors";

describe("forwardErrors", () => {
  it("should catch errors in handlers and forward them using next", () => {
    const next = jest.fn();
    const err = new Error("boom");

    forwardErrors(() => {
      throw err;
    })(null, null, next);

    expect(next).toHaveBeenCalledWith(err);
  });

  it("should catch errors in async handlers and forward them using next", async () => {
    const next = jest.fn();
    const err = new Error("boom");

    await forwardErrors(() => Promise.reject(err))(null, null, next);

    expect(next).toHaveBeenCalledWith(err);
  });

  it("should call handlers with all arguments", () => {
    const [req, res, next, value, name] = [new Request(), new Response(), jest.fn(), "foo", "bar"];
    const handler = jest.fn();

    forwardErrors(handler)(req, res, next, value, name);

    expect(handler).toHaveBeenCalledWith(req, res, next, value, name);
  });
});
