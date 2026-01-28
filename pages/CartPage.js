// pages/CartPage.js
const { expect } = require("@playwright/test");

class CartPage {
  constructor(page) {
    this.page = page;
    this.cartBtn = page.locator("#cart-icon");
    this.cartProduct = page.locator(".cart-product-name").first();
  }

  async openCart() {
    await this.cartBtn.click({ timeout: 10000 });
  }

  async verifyProductInCart(productName) {
    await expect(this.cartProduct).toHaveText(productName, { timeout: 15000 });
  }
}

module.exports = { CartPage };
