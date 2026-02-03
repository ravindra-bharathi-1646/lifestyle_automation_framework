class ProductPage {
  constructor(page) {
    this.page = page;
    this.addToBasketButton = page
      .locator("#notify-quantity")
      .getByRole("button", { name: "ADD TO BASKET" });
    this.genericAddToBasket = page.getByRole("button", {
      name: "ADD TO BASKET",
    });
    this.cartIcon = page.getByRole("button", { name: "cart-icon-" });
    this.qtyDropdown = page.locator("div").filter({ hasText: /^Qty:/ }).first();
    this.popupSelectButton = page.getByRole("button", { name: "SELECT" });

    this.removeButton = page.getByRole("button", { name: "Remove" });
    this.confirmRemoveButton = page.getByRole("button", { name: "REMOVE" });
  }

  async selectSize(size) {
    await this.page.getByRole("button", { name: size, exact: true }).click();
  }

  async addToBasket() {
    await this.page.waitForTimeout(500);
    if (await this.addToBasketButton.isVisible()) {
      await this.addToBasketButton.click();
    } else {
      await this.genericAddToBasket.click();
    }
    await this.page.waitForTimeout(2000);
  }

  async goToCart() {
    await this.cartIcon.click({ force: true });
    try {
      await this.page.waitForURL(/.*cart/, { timeout: 5000 });
    } catch (e) {
      await this.cartIcon.click({ force: true });
      await this.page.waitForURL(/.*cart/);
    }
  }

  async updateQuantity(count) {
    await this.qtyDropdown.waitFor({ state: "visible" });
    await this.qtyDropdown.click();

    const quantityOption = this.page.getByRole("button", {
      name: count.toString(),
      exact: true,
    });
    if (await quantityOption.isVisible()) {
      await quantityOption.click();
      await this.popupSelectButton.click();
      await this.page.waitForTimeout(2000);
    }
  }

  async applyCoupon() {
    await this.page
      .getByText("Offers for you!Select")
      .waitFor({ state: "visible", timeout: 10000 });
    await this.page.getByText("Offers for you!Select").click();

    await this.page
      .locator('input[type="radio"]')
      .first()
      .waitFor({ state: "attached" });
    await this.page
      .locator('input[type="radio"]')
      .first()
      .check({ force: true });

    await this.page.getByRole("button", { name: "APPLY" }).click();
    await this.page.waitForTimeout(1000);
  }

  async removeItem() {
    await this.removeButton.first().waitFor({ state: "visible" });
    await this.removeButton.first().click();
    await this.confirmRemoveButton.click();
    await this.page.waitForTimeout(2000);
  }
}
module.exports = { ProductPage };
