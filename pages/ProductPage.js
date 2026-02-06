class ProductPage {
  constructor(page) {
    this.page = page;
    this.addToBasketButton = page
      .locator("#notify-quantity")
      .getByRole("button", { name: "ADD TO BASKET" });
    this.genericAddToBasket = page.getByRole("button", {
      name: "ADD TO BASKET",
    });
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

  async checkDeliveryDetails(pincode) {
    await this.page
      .getByRole("textbox", { name: "Enter your Pincode" })
      .click();
    await this.page
      .getByRole("textbox", { name: "Enter your Pincode" })
      .fill(pincode);
    await this.page.getByRole("button", { name: "Check" }).click();
  }

  async shareProductAndCopyLink() {
    const shareButton = this.page.getByRole("button", { name: "Share" });
    const copyLinkButton = this.page.getByRole("button", { name: "copy Copy Link" });

    // Hover on Share button to reveal options
    await shareButton.hover();

    // Wait for Copy Link button to appear
    await copyLinkButton.waitFor({ state: "visible", timeout: 5000 });

    // Click Copy Link button
    await copyLinkButton.click({ force: true });
    await this.page.waitForTimeout(500);

    // Read the copied URL from clipboard
    const copiedUrl = await this.page.evaluate(() => navigator.clipboard.readText());
    return copiedUrl;
  }

  async getProductTitle() {
    const titleElement = this.page.locator("div").filter({ hasText: /^FAME FOREVER Printed Regular Fit Shirt$/ }).first();
    await titleElement.waitFor({ state: "visible", timeout: 10000 });
    return await titleElement.textContent();
  }

  async addToFavourites() {
    await this.page.getByRole("button", { name: "Add to Favourites" }).click();
  }
}
module.exports = { ProductPage };
