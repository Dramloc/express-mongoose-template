import request from "supertest";
import app from "../app";
import { dropDatabase, startDatabase, stopDatabase } from "../test-utils/db";

beforeAll(async () => {
  await startDatabase();
});

afterEach(async () => {
  await dropDatabase();
});

afterAll(async () => {
  await stopDatabase();
});

describe("/v1/articles", () => {
  it("should create articles that match article schema", async () => {
    const response = await request(app)
      .post("/v1/articles")
      .send({
        slug: "the-slug",
        title: "The title",
        description: "The description",
        body: "The body",
        tags: ["foo", "bar"],
      });
    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      __v: 0,
      _id: expect.stringMatching(/[0-9a-f]{24}/),
      slug: "the-slug",
      title: "The title",
      description: "The description",
      body: "The body",
      tags: ["foo", "bar"],
      createdAt: expect.stringMatching(
        /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z$/
      ),
      updatedAt: expect.stringMatching(
        /^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}.[0-9]{3}Z$/
      ),
    });
  });

  it("should reject invalid articles", async () => {
    const response = await request(app).post("/v1/articles").send({});

    expect(response.status).toBe(422);
    expect(response.body).toStrictEqual({
      error: "Unprocessable Entity",
      message:
        "Article validation failed: title: Path `title` is required., slug: Path `slug` is required.",
      meta: {
        slug: {
          message: "Path `slug` is required.",
          path: "slug",
          kind: "required",
        },
        title: {
          message: "Path `title` is required.",
          path: "title",
          kind: "required",
        },
      },
      statusCode: 422,
    });
  });

  it("should reject duplicate slugs articles", async () => {
    await request(app).post("/v1/articles").send({
      slug: "the-slug",
      title: "The title",
    });
    const response = await request(app).post("/v1/articles").send({
      slug: "the-slug",
      title: "The title",
    });

    expect(response.status).toBe(422);
    expect(response.body).toStrictEqual({
      error: "Unprocessable Entity",
      message:
        "Article validation failed: slug: Error, expected `slug` to be unique. Value: `the-slug`",
      meta: {
        slug: {
          message: "Error, expected `slug` to be unique. Value: `the-slug`",
          path: "slug",
          kind: "unique",
          value: "the-slug",
        },
      },
      statusCode: 422,
    });
  });

  it("should return created articles when listing them or getting them directly", async () => {
    const createdResponse = await request(app)
      .post("/v1/articles")
      .send({
        slug: "the-slug",
        title: "The title",
        description: "The description",
        body: "The body",
        tags: ["foo", "bar"],
      });

    const listResponse = await request(app).get("/v1/articles");
    expect(listResponse.status).toBe(200);
    expect(listResponse.body).toEqual([createdResponse.body]);

    const singleResponse = await request(app).get(`/v1/articles/${createdResponse.body._id}`);
    expect(singleResponse.status).toBe(200);
    expect(singleResponse.body).toEqual(createdResponse.body);
  });

  it("should return a 400 if the given id is invalid when retrieving an article", async () => {
    const response = await request(app).get(`/v1/articles/foo`);
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      statusCode: 400,
      error: "Bad Request",
      message: "Invalid parameter `_id` with value `foo`.",
    });
  });

  it("should return a 404 if there is no article with the given id when retrieving an article", async () => {
    const response = await request(app).get(`/v1/articles/ffffffffffffffffffffffff`);
    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      statusCode: 404,
      error: "Not Found",
      message: "Cannot find Article with `_id` matching `ffffffffffffffffffffffff`.",
    });
  });

  it("should allow articles to be updated partially", async () => {
    const createdResponse = await request(app)
      .post("/v1/articles")
      .send({
        slug: "the-slug",
        title: "The title",
        description: "The description",
        body: "The body",
        tags: ["foo", "bar"],
      });

    const patchResponse = await request(app)
      .patch(`/v1/articles/${createdResponse.body._id}`)
      .send({ title: "The new title" });
    expect(patchResponse.status).toBe(204);

    const singleResponse = await request(app).get(`/v1/articles/${createdResponse.body._id}`);
    expect(singleResponse.body).toEqual({
      ...createdResponse.body,
      title: "The new title",
      updatedAt: singleResponse.body.updatedAt,
    });
  });

  it("should allow articles to be removed", async () => {
    const createdResponse = await request(app)
      .post("/v1/articles")
      .send({
        slug: "the-slug",
        title: "The title",
        description: "The description",
        body: "The body",
        tags: ["foo", "bar"],
      });

    const removeResponse = await request(app).delete(`/v1/articles/${createdResponse.body._id}`);
    expect(removeResponse.status).toBe(204);

    const singleResponse = await request(app).get(`/v1/articles/${createdResponse.body._id}`);
    expect(singleResponse.status).toBe(404);
  });
});
