import Boom from "@hapi/boom";
import { Request, Response } from "jest-express";
import mongoose from "mongoose";
import { validationErrorHandler } from "./validationErrorHandler";

describe("validationErrorHandler", () => {
  it("should format Boom.badData errors that contain a mongoose validation error correctly", () => {
    const err = new mongoose.Error.ValidationError();
    err.addError(
      "validatedPath",
      new mongoose.Error.ValidatorError({
        message: "validationErrorMessage",
        type: "validationErrorType",
        path: "validatedPath",
        value: "validatedValue",
        reason: "validationErrorReason"
      })
    );
    const [req, res, next] = [new Request(), new Response(), jest.fn()];

    validationErrorHandler(err, req, res, next);

    expect(res.body).toEqual({
      error: "Unprocessable Entity",
      statusCode: 422,
      message: "Validation failed: validatedPath: validationErrorMessage",
      meta: {
        validatedPath: {
          message: "validationErrorMessage",
          type: "validationErrorType",
          path: "validatedPath",
          value: "validatedValue",
          reason: "validationErrorReason"
        }
      }
    });
    expect(res.statusCode).toEqual(422);
  });

  it("should continue if the error is not a Boom.badData", () => {
    const err = Boom.notFound("Another error");
    const [req, res, next] = [new Request(), new Response(), jest.fn()];

    validationErrorHandler(err, req, res, next);

    expect(next).toHaveBeenCalledWith(err);
  });

  it("should continue if the error does not have a mongoose ValidationError stored in the error's data", () => {
    const err = Boom.badData("Validation error");
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
