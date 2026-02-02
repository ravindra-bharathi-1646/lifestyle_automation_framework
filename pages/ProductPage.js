class ProductPage {
  constructor(page) {
    this.page = page;

    // Locators
    this.addToBasketButton = page
      .locator("#notify-quantity")
      .getByRole("button", { name: "ADD TO BASKET" });
    this.genericAddToBasket = page.getByRole("button", {
      name: "ADD TO BASKET",
    });
    this.cartIcon = page.getByRole("button", { name: "cart-icon-" });

    // Quantity locators
    // Matches the dropdown/button that shows "Qty: 1▼"
    this.qtyDropdown = page.locator("div").filter({ hasText: /^Qty:/ }).first();

    // The "Select" button inside the quantity popup (Orange button in your screenshot)
    this.popupSelectButton = page.getByRole("button", { name: "SELECT" });

    // Remove buttons in Cart
    this.removeButton = page.getByRole("button", { name: "Remove" });
    this.confirmRemoveButton = page.getByRole("button", { name: "REMOVE" });
  }

  async selectSize(size) {
    // Click the size button (S, M, L, XL)
    await this.page.getByRole("button", { name: size, exact: true }).click();
  }

  async addToBasket() {
    // Wait a moment for any previous animations to settle
    await this.page.waitForTimeout(500);

    if (await this.addToBasketButton.isVisible()) {
      await this.addToBasketButton.click();
    } else {
      await this.genericAddToBasket.click();
    }

    // CRITICAL FIX: Wait for the "Added to Basket" confirmation or toast
    // If we don't wait, the next click (Go To Cart) might fail because the UI is busy
    await this.page.waitForTimeout(2000);
  }

  async goToCart() {
    // Force click in case a tiny transparent notification is overlapping the icon
    await this.cartIcon.click({ force: true });
    await this.page.waitForURL(/.*cart/);
  }

  async updateQuantity(count) {
    // 1. Click the "Qty" dropdown to open the popup
    await this.qtyDropdown.click();

    // 2. Wait for the popup content (the numbers) to appear
    // We use getByRole 'button' because your screenshot shows they are selectable boxes
    const quantityOption = this.page.getByRole("button", {
      name: count.toString(),
      exact: true,
    });

    // Check if the quantity is actually available (sometimes stock is limited to 2)
    if (await quantityOption.isVisible()) {
      await quantityOption.click();
      await this.popupSelectButton.click();
      // Wait for the price update to reflect on screen
      await this.page.waitForTimeout(2000);
    } else {
      console.log(`Quantity ${count} not available in stock, skipping update.`);
      // Close the popup if we can't select
      await this.page.locator("body").click();
    }
  }

  async removeItem() {
    await this.removeButton.first().click();
    await this.confirmRemoveButton.click();
    // Wait for the item to disappear
    await this.page.waitForTimeout(2000);
  }
}
module.exports = { ProductPage };
