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
    await this.page.getByRole("textbox", { name: "Enter pincode" }).click();
    await this.page
      .getByRole("textbox", { name: "Enter pincode" })
      .fill("600072");
    await this.page.getByRole("button", { name: "Check", exact: true }).click();
    await this.page.waitForTimeout(2000);
    const offersButton = this.page.getByText("Offers for you!Select");
    await offersButton.waitFor({ state: "visible", timeout: 10000 });
    await offersButton.click();
    const select10 = this.page.getByRole("radio", { name: "SELECT10" });
    const save5 = this.page.getByRole("radio", { name: "SAVE5" });
    const anyRadio = this.page.locator('input[type="radio"]').first();
    let couponSelected = false;
    if (await select10.isVisible()) {
      await select10.click({ force: true });
      couponSelected = true;
    } else if (await save5.isVisible()) {
      await save5.click({ force: true });
      couponSelected = true;
    } else if (await anyRadio.isVisible()) {
      await anyRadio.click({ force: true });
      couponSelected = true;
    }
    const applyButton = this.page.getByRole("button", { name: "APPLY" });
    if (couponSelected && (await applyButton.isEnabled())) {
      await applyButton.click();
    } else {
      console.log(
        "No valid coupons available or selected. Closing popup and continuing...",
      );
      await this.page.keyboard.press("Escape");
    }
    await this.page.waitForTimeout(1000);
  }

  async checkDeliveryDetails(pincode) {
    await this.page
      .getByRole("textbox", { name: "Enter your Pincode" })
      .click();
    await this.page
      .getByRole("textbox", { name: "Enter your Pincode" })
      .fill(pincode);
    await this.page.getByRole("button", { name: "Check" }).click();
  }

  async removeItem() {
    await this.removeButton.first().waitFor({ state: "visible" });
    await this.removeButton.first().click();
    await this.confirmRemoveButton.click();
    await this.page.waitForTimeout(2000);
  }
}
module.exports = { ProductPage };
