class HomePage {
  constructor(page) {
    this.page = page;
    this.dontAllowButton = page.getByRole("button", { name: "Don't Allow" });
    this.menMenu = page.getByRole("link", { name: "Men-image Men" });
    this.casualShirtsLink = page.getByRole("link", { name: "Casual Shirts" });
    this.sortButton = page.getByRole("button", { name: "Relevance" });
    this.lowToHighOption = page.getByRole("button", {
      name: "Price - Low to High",
    });
  }

  async navigate() {
    await this.page.goto("https://www.lifestylestores.com/in/en/");
  }

  async dismissNotifications() {
    try {
      await this.dontAllowButton.waitFor({ state: "visible", timeout: 5000 });
      await this.dontAllowButton.click();
    } catch (e) {
      console.log("Notification button did not appear, continuing...");
    }
  }

  async navigateToCasualShirts() {
    await this.menMenu.hover();
    await this.casualShirtsLink.click();
  }

  async sortByPriceLowToHigh() {
    await this.sortButton.click();
    await this.lowToHighOption.click();
  }

  async searchForProduct(term) {
    const searchBar = this.page.getByRole("searchbox", {
      name: "What are you looking for?",
    });
    await searchBar.click();
    await searchBar.fill(term);
    await this.page.keyboard.press("Enter");
    await this.page
      .getByRole("heading", { name: `You searched for ${term}` })
      .waitFor();
  }
  async applyBrandFilter(brandName) {
    // Click on Brand filter section
    await this.page.getByRole("button", { name: "Brand" }).click();
    await this.page.waitForTimeout(500);

    // Select the brand checkbox
    const brandCheckbox = this.page.getByRole("checkbox", { name: brandName });
    await brandCheckbox.waitFor({ state: "visible", timeout: 10000 });
    await brandCheckbox.click();
    await this.page.waitForTimeout(1000);
  }

  async applySizeFilter(size) {
    // Click on Size filter section
    await this.page.getByRole("button", { name: "Size" }).click();
    await this.page.waitForTimeout(500);

    // Select the size checkbox
    const sizeCheckbox = this.page.getByRole("checkbox", { name: size, exact: true });
    await sizeCheckbox.waitFor({ state: "visible", timeout: 10000 });
    await sizeCheckbox.click();
    await this.page.waitForTimeout(1000);
  }
}
module.exports = { HomePage };
