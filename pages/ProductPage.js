class ProductPage {
  constructor(page) {
    this.page = page;
    // Main Add to Basket button (inside the quantity container)
    this.addToBasketButton = page
      .locator("#notify-quantity")
      .getByRole("button", { name: "ADD TO BASKET" });
    // Generic Add to Basket (fallback)
    this.generalAddToBasketButton = page.getByRole("button", {
      name: "ADD TO BASKET",
    });
    this.cartIcon = page.getByRole("button", { name: "cart-icon-" });
  }

  // Use a dynamic method to click any size
  async selectSize(size) {
    await this.page.getByRole("button", { name: size, exact: true }).click();
  }

  async addToBasket() {
    // We try the specific one first, then the general one
    if (await this.addToBasketButton.isVisible()) {
      await this.addToBasketButton.click();
    } else {
      await this.generalAddToBasketButton.click();
    }
  }

  async goToCart() {
    await this.cartIcon.click();
  }
}

module.exports = { ProductPage };
