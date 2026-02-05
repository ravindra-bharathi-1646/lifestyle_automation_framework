// pages/CartPage.js
const { expect } = require("@playwright/test");

class CartPage {
  constructor(page) {
    this.page = page;
    this.cartIcon = page.getByRole("button", { name: "cart-icon-" });
    this.qtyDropdown = page.locator("div").filter({ hasText: /^Qty:/ }).first();
    this.popupSelectButton = page.getByRole("button", { name: "SELECT" });
    this.removeButton = page.getByRole("button", { name: "Remove" });
    this.confirmRemoveButton = page.getByRole("button", { name: "REMOVE" });
  }

  async goToCart() {
    await this.cartIcon.click({ force: true });
    await this.page.waitForURL(/.*cart/, { timeout: 15000 });
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

  async removeItem() {
    await this.removeButton.first().waitFor({ state: "visible" });
    await this.removeButton.first().click();
    await this.confirmRemoveButton.click();
    await this.page.waitForTimeout(2000);
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

  async verifyProductInCart(productName) {
    await expect(this.page.getByText(productName)).toBeVisible({ timeout: 10000 });
  }

  async verifySizeInCart(size) {
    await expect(this.page.getByText(new RegExp(`Size:${size}`, 'i'))).toBeVisible({ timeout: 10000 });
  }

  async verifyEmptyCart() {
    await expect(
      this.page.getByText("The best fashion is waiting", { exact: false }),
    ).toBeVisible();
  }
}

module.exports = { CartPage };
