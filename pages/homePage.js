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
  }

  async applyBrandFilter(brandName) {
    await this.page.getByRole("button", { name: "Brand" }).click();
    await this.page.waitForTimeout(500);
    const brandCheckbox = this.page.getByRole("checkbox", { name: brandName });
    await brandCheckbox.waitFor({ state: "visible", timeout: 10000 });
    await brandCheckbox.click();
    await this.page.waitForTimeout(1000);
  }

  async applySizeFilter(size) {
    await this.page.getByRole("button", { name: "Size" }).click();
    await this.page.waitForTimeout(500);
    const sizeCheckbox = this.page.getByRole("checkbox", {
      name: size,
      exact: true,
    });
    await sizeCheckbox.waitFor({ state: "visible", timeout: 10000 });
    await sizeCheckbox.click();
    await this.page.waitForTimeout(1000);
  }

  async login(mobileNumber) {
    await this.page.getByRole("button", { name: "SIGN UP / SIGN IN" }).click();
    await this.page
      .getByRole("textbox", { name: "Mobile Number" })
      .fill(mobileNumber);
    await this.page.getByRole("button", { name: "Continue" }).click();
    await this.page.pause();
  }

  async verifyLoggedIn(userName) {
    const welcomeText = `Welcome ${userName}!AccountFavouritesBasketMore`;
  }

  async goToFavourites() {
    await this.page
      .locator(
        "#root-header > div > div > div.MuiBox-root.jss64.jss44 > div.MuiBox-root.jss65 > div > div > div.MuiBox-root.jss79.jss61 > div.MuiBox-root.jss88.jss60.jss63",
      )
      .click();
  }
}
module.exports = { HomePage };
