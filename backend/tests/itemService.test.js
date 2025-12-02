const { validateItemPayload, ValidationError } = require("../service/itemService");

describe("itemService validation", () => {
  test("valid payload passes validation", () => {
    const payload = {
      name: "Вудилище",
      price: 1000,
      description: "Тестовий опис",
      category: "Вудилища"
    };
    expect(() => validateItemPayload(payload, false)).not.toThrow();
  });

  test("missing name causes validation error", () => {
    const payload = {
      price: 1000
    };
    try {
      validateItemPayload(payload, false);
    } catch (err) {
      expect(err).toBeInstanceOf(ValidationError);
      expect(err.details.length).toBeGreaterThan(0);
      expect(err.details[0].field).toBe("name");
      return;
    }
    throw new Error("Expected ValidationError to be thrown");
  });
});
