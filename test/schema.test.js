const assert = require("assert");
const { listingSchema, reviewSchema } = require("../schema");

describe("schemas", () => {
  it("rejects invalid listings and reviews", () => {
    assert(listingSchema.validate({ listing: {} }).error);
    assert(reviewSchema.validate({ review: { rating: 0, comment: "" } }).error);
  });
});
