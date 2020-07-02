import Boom from "@hapi/boom";
import { validateObjectId } from "./validateObjectId";

describe("validateObjectId", () => {
  it("should call next if the given id is a valid MongoDB object id", () => {
    const next = jest.fn();
    validateObjectId(null, null, next, "507f1f77bcf86cd799439011", "id");
    expect(next).toHaveBeenCalledWith();
  });

  it("should call next with an error if the given id is not a valid MongoDB object id", () => {
    const next = jest.fn();
    validateObjectId(null, null, next, "not a real object id", "id");
    expect(next).toHaveBeenCalledWith(
      Boom.badRequest(`Invalid parameter \`id\` with value \`not a real object id\`.`)
    );
  });
});
