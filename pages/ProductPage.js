class ProductPage {
  constructor(page) {
    this.page = page;
    this.sizeLButton = page.getByRole("button", { name: "L", exact: true });
    this.addToBasketButton = page
      .locator("#notify-quantity")
      .getByRole("button", { name: "ADD TO BASKET" });
    this.cartIcon = page.getByRole("button", { name: "cart-icon-" });
    this.reviewClose = page.locator("#review-close");
  }

  async selectSizeL() {
    await this.sizeLButton.click();
  }

  async addToBasket() {
    await this.addToBasketButton.click();
  }

  async goToCart() {
    await this.cartIcon.click();
  }
}
module.exports = { ProductPage };
