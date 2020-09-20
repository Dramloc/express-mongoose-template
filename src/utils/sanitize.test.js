import { sanitize } from "./sanitize";

describe("sanitize", () => {
  it("should remove mongoose special properties from request body", () => {
    expect(
      sanitize({
        foo: "bar",
        createdAt: "2020-06-24T21:40:01.760Z",
        updatedAt: "2020-06-24T21:40:01.760Z",
        __v: 0,
      })
    ).toStrictEqual({
      foo: "bar",
    });
  });
});
