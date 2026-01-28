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
    // Wait for the button to be attached before clicking
    await this.dontAllowButton.waitFor({ state: "visible" });
    await this.dontAllowButton.click();
  }

  async navigateToCasualShirts() {
    await this.menMenu.hover();
    await this.casualShirtsLink.click();
  }

  async sortByPriceLowToHigh() {
    await this.sortButton.click();
    await this.lowToHighOption.click();
  }
}
module.exports = { HomePage };
