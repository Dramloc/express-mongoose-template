import Boom from "@hapi/boom";
import { Request, Response } from "jest-express";
import { find, findById, load, validateParam } from "./rest.js";

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

describe("validateParam", () => {
  it("should continue to the next middleware if the handler validates the param", async () => {
    const handler = () => true;
    const [req, res, next] = [new Request(), new Response(), jest.fn()];

    await validateParam({ handler })(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("should allow the handler to resolve to true with a promise", async () => {
    const handler = () => Promise.resolve(true);
    const [req, res, next] = [new Request(), new Response(), jest.fn()];

    await validateParam({ handler })(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it("should forward an error if the handler does not validate the param", async () => {
    const handler = () => false;
    const [req, res, next] = [new Request(), new Response(), jest.fn()];

    await validateParam({ handler })(req, res, next, "invalid value", "param name");

    expect(next).toHaveBeenCalledWith(
      Boom.badRequest('Invalid parameter `param name` with value `"invalid value"`.')
    );
  });

  it("should allow the handler to resolve to false with a promise", async () => {
    const handler = () => Promise.resolve(false);
    const [req, res, next] = [new Request(), new Response(), jest.fn()];

    await validateParam({ handler })(req, res, next, "invalid value", "param name");

    expect(next).toHaveBeenCalledWith(
      Boom.badRequest('Invalid parameter `param name` with value `"invalid value"`.')
    );
  });

  it("should allow the handler to throw to invalidate the param", async () => {
    const err = new Error("invalid param");
    const handler = () => {
      throw err;
    };
    const [req, res, next] = [new Request(), new Response(), jest.fn()];

    await validateParam({ handler })(req, res, next, "invalid value", "param name");

    expect(next).toHaveBeenCalledWith(err);
  });

  it("should allow the handler to reject with a promise to invalidate the param", async () => {
    const err = new Error("invalid param");
    const handler = () => Promise.reject(err);
    const [req, res, next] = [new Request(), new Response(), jest.fn()];

    await validateParam({ handler })(req, res, next, "invalid value", "param name");

    expect(next).toHaveBeenCalledWith(err);
  });

  it("should format the error message correctly for arrays", async () => {
    const handler = () => false;
    const [req, res, next] = [new Request(), new Response(), jest.fn()];

    await validateParam({ handler })(req, res, next, ["foo", "bar"], "param name");

    expect(next).toHaveBeenCalledWith(
      Boom.badRequest('Invalid parameter `param name` with value `["foo","bar"]`.')
    );
  });

  it("should format the error message correctly for objects", async () => {
    const handler = () => false;
    const [req, res, next] = [new Request(), new Response(), jest.fn()];

    await validateParam({ handler })(req, res, next, { foo: "foo", bar: "bar" }, "param name");

    expect(next).toHaveBeenCalledWith(
      Boom.badRequest('Invalid parameter `param name` with value `{"foo":"foo","bar":"bar"}`.')
    );
  });
});

describe("load", () => {
  it("should call the given handler and store the result in an express locals", async () => {
    const handler = () => ({ test: "document" });
    const [req, res, next] = [new Request(), new Response(), jest.fn()];

    await load({ handler })(req, res, next, "some value", "some param");

    expect(res.locals.document).toEqual({ test: "document" });
  });

  it("should call the given handler with the param value and the request", async () => {
    const handler = jest.fn(() => ({ test: "document" }));
    const [req, res, next] = [new Request(), new Response(), jest.fn()];

    await load({ handler })(req, res, next, "some value", "some param");

    expect(handler).toHaveBeenCalledWith("some value", req);
  });

  it("should return a 404 if the handler returns a falsy value", async () => {
    const handler = () => null;
    const [req, res, next] = [new Request(), new Response(), jest.fn()];

    await load({ handler })(req, res, next, "some value", "some param");

    expect(next).toHaveBeenCalledWith(
      Boom.notFound(`Document with \`some param\` matching \`some value\` not found.`)
    );
  });

  it("should not store anything if the handler returns a falsy value", async () => {
    const handler = () => null;
    const [req, res, next] = [new Request(), new Response(), jest.fn()];

    await load({ handler })(req, res, next, "some value", "some param");

    expect(res.locals.document).toBeUndefined();
  });

  it("should allow error message to be customized to match the document model name", async () => {
    const handler = () => null;
    const [req, res, next] = [new Request(), new Response(), jest.fn()];

    await load({ handler, modelName: "Something" })(req, res, next, "some value", "some param");

    expect(next).toHaveBeenCalledWith(
      Boom.notFound(`Something with \`some param\` matching \`some value\` not found.`)
    );
  });

  it("should allow document to be stored at a different locals key", async () => {
    const handler = () => ({ test: "document" });
    const [req, res, next] = [new Request(), new Response(), jest.fn()];

    await load({ handler, documentKey: "anotherKey" })(req, res, next, "some value", "some param");

    expect(res.locals.anotherKey).toEqual({ test: "document" });
    expect(res.locals.document).toBeUndefined();
  });

  it("should call the next function if a document is found", async () => {
    const handler = () => ({ test: "document" });
    const [req, res, next] = [new Request(), new Response(), jest.fn()];

    await load({ handler })(req, res, next, "some value", "some param");

    expect(next).toHaveBeenCalledWith();
  });

  it("should allow the handler to resolve the document with a promise", async () => {
    const handler = () => Promise.resolve({ test: "document" });
    const [req, res, next] = [new Request(), new Response(), jest.fn()];

    await load({ handler })(req, res, next, "some value", "some param");

    expect(res.locals.document).toEqual({ test: "document" });
  });

  it("should allow the handler to resolve with no document with a promise", async () => {
    const handler = () => Promise.resolve(null);
    const [req, res, next] = [new Request(), new Response(), jest.fn()];

    await load({ handler })(req, res, next, "some value", "some param");

    expect(next).toHaveBeenCalledWith(
      Boom.notFound(`Document with \`some param\` matching \`some value\` not found.`)
    );
  });

  it("should forwards the error if the handler rejects", async () => {
    const err = new Error("handler rejection");
    const handler = () => Promise.reject(err);
    const [req, res, next] = [new Request(), new Response(), jest.fn()];

    await load({ handler })(req, res, next, "some value", "some param");

    expect(next).toHaveBeenCalledWith(err);
  });
});

describe("findById", () => {
  it("should respond a stored express local", () => {
    const [req, res, next] = [new Request(), new Response(), jest.fn()];
    res.setLocals("document", { test: "document" });

    findById()(req, res, next);

    expect(res.body).toEqual({ test: "document" });
    expect(res.statusCode).toEqual(200);
  });

  it("should allow another local key to be used", () => {
    const [req, res, next] = [new Request(), new Response(), jest.fn()];
    res.setLocals("anotherKey", { test: "document" });

    findById({ documentKey: "anotherKey" })(req, res, next);

    expect(res.body).toEqual({ test: "document" });
  });

  it("should respond with undefined if there is no stored express local", () => {
    const [req, res, next] = [new Request(), new Response(), jest.fn()];

    findById()(req, res, next);

    expect(res.body).toBeUndefined();
  });
});
