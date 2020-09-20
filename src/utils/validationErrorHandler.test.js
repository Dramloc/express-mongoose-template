import Boom from "@hapi/boom";
import { Request, Response } from "jest-express";
import mongoose from "mongoose";
import { validationErrorHandler } from "./validationErrorHandler";

describe("validationErrorHandler", () => {
  it("should format mongoose `ValidationError` errors correctly", () => {
    const err = new mongoose.Error.ValidationError();
    err.addError(
      "validatedPath",
      new mongoose.Error.ValidatorError({
        message: "validationErrorMessage",
        type: "validationErrorType",
        path: "validatedPath",
        value: "validatedValue",
        reason: "validationErrorReason",
      })
    );
    const [req, res, next] = [new Request(), new Response(), jest.fn()];
    validationErrorHandler(err, req, res, next);
    expect(next).toHaveBeenCalledWith(
      Boom.badData("Validation failed: validatedPath: validationErrorMessage", {
        meta: {
          validatedPath: {
            message: "validationErrorMessage",
            kind: "validationErrorType",
            path: "validatedPath",
            value: "validatedValue",
            reason: "validationErrorReason",
          },
        },
      })
    );
  });

  it("should continue if the error is not a mongoose `ValidationError", () => {
    const err = new Error("Another error");
    const [req, res, next] = [new Request(), new Response(), jest.fn()];
    validationErrorHandler(err, req, res, next);
    expect(next).toHaveBeenCalledWith(err);
  });

  it("should continue if there is no error", () => {
    const err = undefined;
    const [req, res, next] = [new Request(), new Response(), jest.fn()];
    validationErrorHandler(err, req, res, next);
    expect(next).toHaveBeenCalledWith();
  });
});
