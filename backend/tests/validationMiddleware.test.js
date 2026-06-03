const assert = require("node:assert/strict");
const test = require("node:test");
const {
  validateBooking,
  validateRegister,
  validateRoom,
} = require("../middleware/validationMiddleware");

const createResponse = () => {
  const res = {
    statusCode: 200,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };

  return res;
};

test("validateRegister rejects weak registration data", () => {
  const req = {
    body: {
      name: "",
      email: "not-an-email",
      password: "123",
    },
  };
  const res = createResponse();
  let nextCalled = false;

  validateRegister(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, "Validation failed");
  assert.match(res.body.errors.join(" "), /Password/);
});

test("validateRoom normalizes valid room payloads", () => {
  const req = {
    body: {
      name: "  Deluxe Room  ",
      price: "2999",
      description: "  Valley view stay  ",
    },
  };
  const res = createResponse();
  let nextCalled = false;

  validateRoom(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, true);
  assert.equal(req.body.name, "Deluxe Room");
  assert.equal(req.body.price, 2999);
  assert.equal(req.body.description, "Valley view stay");
  assert.equal(req.body.available, true);
});

test("validateBooking rejects invalid booking date ranges", () => {
  const req = {
    body: {
      room: "507f1f77bcf86cd799439011",
      name: "Guest User",
      email: "guest@example.com",
      checkIn: "2026-06-10",
      checkOut: "2026-06-09",
      guests: 2,
    },
  };
  const res = createResponse();
  let nextCalled = false;

  validateBooking(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 400);
  assert.ok(res.body.errors.includes("Check-out must be after check-in"));
});
