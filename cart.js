function round2(num) {
  return Math.round(num * 100) / 100;
}

class CartItem {
  constructor(sku, name, unitPrice, qty = 1) {
    if (!sku || typeof sku !== "string") {
      throw new Error("SKU is required");
    }
    if (!name || typeof name !== "string") {
      throw new Error("Name is required");
    }
    if (typeof unitPrice !== "number" || unitPrice <= 0) {
      throw new Error("unitPrice must be > 0");
    }
    if (!Number.isInteger(qty) || qty <= 0) {
      throw new Error("qty must be positive integer");
    }

    this.sku = sku;
    this.name = name;
    this.unitPrice = unitPrice;
    this.qty = qty;
  }

  get lineTotal() {
    return this.unitPrice * this.qty;
  }
}

class Cart {
  constructor(config = {}) {
    this.items = [];
    this.promoCodes = config.promoCodes || {
      SALE10: 10,
      FREE100: 100,
    };
    this.appliedPromo = null;
  }

  addItem(item) {
    if (!(item instanceof CartItem)) {
      throw new Error("item must be CartItem");
    }

    const existing = this.items.find((i) => i.sku === item.sku);
    if (existing) {
      existing.qty += item.qty;
    } else {
      this.items.push(item);
    }
  }

  updateQty(sku, newQty) {
    if (!Number.isInteger(newQty) || newQty <= 0) {
      throw new Error("newQty must be positive integer");
    }
    const item = this.items.find((i) => i.sku === sku);
    if (!item) {
      throw new Error("Item not found");
    }
    item.qty = newQty;
  }

  removeItem(sku) {
    const index = this.items.findIndex((i) => i.sku === sku);
    if (index === -1) {
      throw new Error("Item not found");
    }
    this.items.splice(index, 1);
  }

  getSubtotal() {
    if (this.items.length === 0) return 0;
    return this.items.reduce((sum, i) => sum + i.lineTotal, 0);
  }

  applyPromo(code) {
    if (!code || typeof code !== "string") {
      throw new Error("Promo code must be non-empty string");
    }

    const promoValue = this.promoCodes[code];
    if (promoValue === undefined) {
      throw new Error("Invalid promo code");
    }

    if (promoValue < 0 || promoValue > 100) {
      throw new Error("Configured promo is out of range 0..100");
    }

    this.appliedPromo = promoValue;
  }

  getTotal() {
    const subtotal = this.getSubtotal();
    if (this.appliedPromo === null) {
      return round2(subtotal);
    }

    const discount = (subtotal * this.appliedPromo) / 100;
    const total = subtotal - discount;
    return round2(total < 0 ? 0 : total);
  }
}

module.exports = { CartItem, Cart, round2 };
