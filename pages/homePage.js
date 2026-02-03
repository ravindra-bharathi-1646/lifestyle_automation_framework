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
  }
}
module.exports = { HomePage };
