const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("crypto");
const Module = require("module");

function loadModuleWithMocks(modulePath, mocks) {
  const originalLoad = Module._load;

  Module._load = function patchedLoad(request, parent, isMain) {
    if (Object.prototype.hasOwnProperty.call(mocks, request)) {
      return mocks[request];
    }

    return originalLoad(request, parent, isMain);
  };

  delete require.cache[require.resolve(modulePath)];

  try {
    return require(modulePath);
  } finally {
    Module._load = originalLoad;
  }
}

function createResponseRecorder() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

function buildSignature(orderId, paymentId, secret) {
  return crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");
}

test("verifyPayment rejects mismatched Razorpay order details", async () => {
  process.env.RAZORPAY_KEY_SECRET = "test_secret";
  process.env.RAZORPAY_KEY_ID = "test_key";

  const bookingModel = {
    findOne: () => null,
    create: async () => {
      throw new Error("Booking.create should not be called for mismatched orders");
    },
  };

  const roomModel = {
    findById: async () => ({
      _id: "room123",
      name: "Deluxe Room",
      price: 5000,
    }),
  };

  function RazorpayMock() {
    return {
      orders: {
        fetch: async () => ({
          amount: 499999,
          currency: "INR",
          notes: {
            roomId: "room123",
            userId: "user123",
            nights: "2",
          },
        }),
      },
    };
  }

  const { verifyPayment } = loadModuleWithMocks("../controllers/paymentController", {
    "../models/Booking": bookingModel,
    "../models/Room": roomModel,
    razorpay: RazorpayMock,
  });

  const req = {
    user: { _id: "user123" },
    body: {
      razorpayOrderId: "order_123",
      razorpayPaymentId: "pay_123",
      razorpaySignature: buildSignature("order_123", "pay_123", process.env.RAZORPAY_KEY_SECRET),
      room: "507f1f77bcf86cd799439011",
      name: "Asha",
      email: "asha@example.com",
      checkIn: "2026-07-10",
      checkOut: "2026-07-12",
      guests: 2,
    },
  };
  const res = createResponseRecorder();

  await verifyPayment(req, res);

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.message, "Payment verification failed: order details do not match booking");
});

test("verifyPayment blocks overlapping paid bookings", async () => {
  process.env.RAZORPAY_KEY_SECRET = "test_secret";
  process.env.RAZORPAY_KEY_ID = "test_key";

  let createCalled = false;
  const bookingModel = {
    findOne: (query) => {
      if (Object.prototype.hasOwnProperty.call(query, "payment.razorpayPaymentId")) {
        return null;
      }

      if (query.status) {
        return {
          select: async () => ({ _id: "existing-booking" }),
        };
      }

      return null;
    },
    create: async () => {
      createCalled = true;
      return null;
    },
  };

  const roomModel = {
    findById: async () => ({
      _id: "507f1f77bcf86cd799439011",
      name: "Deluxe Room",
      price: 5000,
    }),
  };

  function RazorpayMock() {
    return {
      orders: {
        fetch: async () => ({
          amount: 1000000,
          currency: "INR",
          notes: {
            roomId: "507f1f77bcf86cd799439011",
            userId: "user123",
            nights: "2",
          },
        }),
      },
    };
  }

  const { verifyPayment } = loadModuleWithMocks("../controllers/paymentController", {
    "../models/Booking": bookingModel,
    "../models/Room": roomModel,
    razorpay: RazorpayMock,
  });

  const req = {
    user: { _id: "user123" },
    body: {
      razorpayOrderId: "order_456",
      razorpayPaymentId: "pay_456",
      razorpaySignature: buildSignature("order_456", "pay_456", process.env.RAZORPAY_KEY_SECRET),
      room: "507f1f77bcf86cd799439011",
      name: "Asha",
      email: "asha@example.com",
      checkIn: "2026-07-10",
      checkOut: "2026-07-12",
      guests: 2,
    },
  };
  const res = createResponseRecorder();

  await verifyPayment(req, res);

  assert.equal(res.statusCode, 409);
  assert.equal(res.body.message, "Room is no longer available for the selected dates");
  assert.equal(createCalled, false);
});

test("createOrder blocks bookings when the room is already unavailable", async () => {
  process.env.RAZORPAY_KEY_SECRET = "test_secret";
  process.env.RAZORPAY_KEY_ID = "test_key";

  let razorpayCreateCalled = false;
  const bookingModel = {
    findOne: () => ({
      select: async () => ({ _id: "existing-booking" }),
    }),
  };

  const roomModel = {
    findById: async () => ({
      _id: "507f1f77bcf86cd799439011",
      name: "Deluxe Room",
      price: 5000,
    }),
  };

  function RazorpayMock() {
    return {
      orders: {
        create: async () => {
          razorpayCreateCalled = true;
          return { id: "order_789", amount: 1000000, currency: "INR" };
        },
      },
    };
  }

  const { createOrder } = loadModuleWithMocks("../controllers/paymentController", {
    "../models/Booking": bookingModel,
    "../models/Room": roomModel,
    razorpay: RazorpayMock,
  });

  const req = {
    user: { _id: "user123" },
    body: {
      room: "507f1f77bcf86cd799439011",
      name: "Asha",
      email: "asha@example.com",
      checkIn: "2026-07-10",
      checkOut: "2026-07-12",
      guests: 2,
    },
  };
  const res = createResponseRecorder();

  await createOrder(req, res);

  assert.equal(res.statusCode, 409);
  assert.equal(res.body.message, "Room is no longer available for the selected dates");
  assert.equal(razorpayCreateCalled, false);
});

test("updateBooking rejects user-driven status changes", async () => {
  const bookingDoc = {
    _id: "507f1f77bcf86cd799439012",
    user: { toString: () => "user123" },
    room: "507f1f77bcf86cd799439011",
    status: "pending",
    checkIn: new Date("2026-07-10"),
    checkOut: new Date("2026-07-12"),
    guests: 2,
    save: async () => {
      throw new Error("save should not be called");
    },
  };

  const bookingModel = {
    findById: async () => bookingDoc,
  };

  const roomModel = {};

  const { updateBooking } = loadModuleWithMocks("../controllers/bookingController", {
    "../models/Booking": bookingModel,
    "../models/Room": roomModel,
  });

  const req = {
    params: { id: "507f1f77bcf86cd799439012" },
    user: { _id: "user123" },
    body: { status: "confirmed" },
  };
  const res = createResponseRecorder();

  await updateBooking(req, res);

  assert.equal(res.statusCode, 403);
  assert.equal(res.body.message, "Forbidden: booking status cannot be changed from this endpoint");
});

test("room routes protect room creation with auth and admin role middleware", async () => {
  const authMiddleware = require("../middleware/authMiddleware");
  const router = require("../routes/roomRoutes");
  const postRouteLayer = router.stack.find(
    (layer) => layer.route && layer.route.path === "/" && layer.route.methods.post
  );

  assert.ok(postRouteLayer, "Expected POST / room route to exist");

  const routeHandlers = postRouteLayer.route.stack.map((layer) => layer.handle);
  assert.equal(routeHandlers[0], authMiddleware.protect);

  const adminOnlyMiddleware = routeHandlers[1];
  const req = { user: { role: "user" } };
  const res = createResponseRecorder();
  let nextCalled = false;

  adminOnlyMiddleware(req, res, () => {
    nextCalled = true;
  });

  assert.equal(nextCalled, false);
  assert.equal(res.statusCode, 403);
  assert.equal(res.body.message, "Forbidden: insufficient permissions");
});
