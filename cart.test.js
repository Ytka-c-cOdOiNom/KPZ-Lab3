const { CartItem, Cart, round2 } = require("./cart");

describe("CartItem", () => {
  test("створення з валідними даними", () => {
    const item = new CartItem("SKU1", "Товар 1", 10.5, 2);
    expect(item.sku).toBe("SKU1");
    expect(item.name).toBe("Товар 1");
    expect(item.unitPrice).toBe(10.5);
    expect(item.qty).toBe(2);
    expect(item.lineTotal).toBe(21);
  });

  test("SKU не заданий або не string → помилка", () => {
    expect(() => new CartItem(null, "Test", 10)).toThrow("SKU is required");
    expect(() => new CartItem(123, "Test", 10)).toThrow("SKU is required");
  });

  test("Name не заданий або не string → помилка", () => {
    expect(() => new CartItem("A", null, 10)).toThrow("Name is required");
    expect(() => new CartItem("A", 123, 10)).toThrow("Name is required");
  });

  test("unitPrice ≤ 0 або не число → помилка", () => {
    expect(() => new CartItem("A", "B", 0)).toThrow("unitPrice must be > 0");
    expect(() => new CartItem("A", "B", -5)).toThrow("unitPrice must be > 0");
    expect(() => new CartItem("A", "B", "10")).toThrow("unitPrice must be > 0");
  });

  test("qty не позитивне ціле → помилка", () => {
    expect(() => new CartItem("A", "B", 10, 0)).toThrow(
      "qty must be positive integer"
    );
    expect(() => new CartItem("A", "B", 10, -1)).toThrow(
      "qty must be positive integer"
    );
    expect(() => new CartItem("A", "B", 10, 1.5)).toThrow(
      "qty must be positive integer"
    );
  });
});

describe("Cart", () => {
  let cart;
  let itemA, itemB;

  beforeEach(() => {
    cart = new Cart();
    itemA = new CartItem("A1", "Товар A", 10, 2);
    itemB = new CartItem("B1", "Товар B", 5, 3);
  });

  // Валідації
  test("addItem з не CartItem → помилка", () => {
    expect(() => cart.addItem({})).toThrow("item must be CartItem");
  });

  test("updateQty з невалідною кількістю → помилка", () => {
    cart.addItem(itemA);
    expect(() => cart.updateQty("A1", 0)).toThrow(
      "newQty must be positive integer"
    );
    expect(() => cart.updateQty("A1", -1)).toThrow(
      "newQty must be positive integer"
    );
    expect(() => cart.updateQty("A1", 1.5)).toThrow(
      "newQty must be positive integer"
    );
  });

  test("updateQty для неіснуючого SKU → помилка", () => {
    expect(() => cart.updateQty("XXX", 2)).toThrow("Item not found");
  });

  test("removeItem для неіснуючого SKU → помилка", () => {
    expect(() => cart.removeItem("XXX")).toThrow("Item not found");
  });

  // Операції з кошиком
  test("додавання нового елемента", () => {
    cart.addItem(itemA);
    expect(cart.items.length).toBe(1);
    expect(cart.items[0].sku).toBe("A1");
  });

  test("додавання того ж SKU → об’єднання кількості", () => {
    cart.addItem(itemA);
    cart.addItem(new CartItem("A1", "Товар A", 10, 3));
    expect(cart.items.length).toBe(1);
    expect(cart.items[0].qty).toBe(5);
  });

  test("оновлення кількості", () => {
    cart.addItem(itemA);
    cart.updateQty("A1", 10);
    expect(cart.items[0].qty).toBe(10);
  });

  test("видалення елемента", () => {
    cart.addItem(itemA);
    cart.removeItem("A1");
    expect(cart.items.length).toBe(0);
  });

  // Розрахунки
  test("getSubtotal з кількома товарами", () => {
    cart.addItem(itemA);
    cart.addItem(itemB);
    expect(cart.getSubtotal()).toBe(35);
  });

  test("getSubtotal порожній кошик → 0", () => {
    expect(cart.getSubtotal()).toBe(0);
  });

  // Промокоди
  test("applyPromo з не-string або порожнім кодом → помилка", () => {
    expect(() => cart.applyPromo(null)).toThrow(
      "Promo code must be non-empty string"
    );
    expect(() => cart.applyPromo(123)).toThrow(
      "Promo code must be non-empty string"
    );
  });

  test("applyPromo з невалідним кодом → помилка", () => {
    expect(() => cart.applyPromo("INVALID")).toThrow("Invalid promo code");
  });

  test("applyPromo з кодом >100% → помилка", () => {
    const badCart = new Cart({ promoCodes: { BAD200: 200 } });
    expect(() => badCart.applyPromo("BAD200")).toThrow(
      "Configured promo is out of range 0..100"
    );
  });

  test("валідний промокод SALE10 → 10% знижка", () => {
    cart.addItem(itemA);
    cart.addItem(itemB);
    cart.applyPromo("SALE10");
    expect(cart.getTotal()).toBe(31.5);
  });

  test("промокод FREE100 → total = 0", () => {
    cart.addItem(itemA);
    cart.applyPromo("FREE100");
    expect(cart.getTotal()).toBe(0);
  });

  test("getTotal без промокоду → повертає subtotal", () => {
    cart.addItem(itemA);
    expect(cart.getTotal()).toBe(cart.getSubtotal());
  });

  // Округлення
  test("округлення total до 2 знаків", () => {
    cart.addItem(new CartItem("X1", "Товар X", 19.999, 1));
    expect(cart.getTotal()).toBe(20.0);
  });
});

describe("round2()", () => {
  test("округлення до 2 знаків", () => {
    expect(round2(12.3456)).toBe(12.35);
    expect(round2(12.341)).toBe(12.34);
  });
});
