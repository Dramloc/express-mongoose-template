import { Request, Response } from "jest-express";
import { find } from "./rest.js";

describe("find", () => {
  it("should return the list of documents returned by the handler as json", async () => {
    const list = [{ name: "foo" }, { name: "bar" }, { name: "baz" }];
    const handler = () => [list, 10];
    const [req, res] = [new Request(), new Response()];

    await find({ handler })(req, res);

    expect(res.body).toEqual(list);
  });

  it("should allow handler to return promises", async () => {
    const list = [{ name: "foo" }, { name: "bar" }, { name: "baz" }];
    const handler = () => Promise.resolve([list, 10]);
    const [req, res] = [new Request(), new Response()];

    await find({ handler })(req, res);

    expect(res.body).toEqual(list);
  });

  it("should set the document total count header with the value returned by the handler in the response", async () => {
    const list = [{ name: "foo" }, { name: "bar" }, { name: "baz" }];
    const handler = () => [list, 10];
    const [req, res] = [new Request(), new Response()];

    await find({ handler })(req, res);

    expect(res.getHeader("X-Total-Count")).toEqual("10");
  });

  it("should allow the use of another header name for the total count of documents", async () => {
    const list = [{ name: "foo" }, { name: "bar" }, { name: "baz" }];
    const handler = () => [list, 4];
    const [req, res] = [new Request(), new Response()];

    await find({ handler, totalCountHeader: "Page-Count" })(req, res);

    expect(res.getHeader("Page-Count")).toEqual("4");
    expect(res.getHeader("X-Total-Count")).toBeUndefined();
  });

  it("should call the handler with the request object", async () => {
    const list = [{ name: "foo" }, { name: "bar" }, { name: "baz" }];
    const handler = jest.fn(() => [list, 10]);
    const [req, res] = [new Request(), new Response()];

    await find({ handler })(req, res);

    expect(handler).toHaveBeenCalledWith(req);
  });

  it("should forward errors thrown by the handler using the next function", async () => {
    const err = new Error();
    const handler = () => {
      throw err;
    };
    const [req, res, next] = [new Request(), new Response(), jest.fn()];

    await find({ handler })(req, res, next);

    expect(next).toHaveBeenCalledWith(err);
  });

  it("should forward promise rejections using the next function", async () => {
    const err = new Error();
    const handler = () => Promise.reject(err);
    const [req, res, next] = [new Request(), new Response(), jest.fn()];

    await find({ handler })(req, res, next);

    expect(next).toHaveBeenCalledWith(err);
  });
});
