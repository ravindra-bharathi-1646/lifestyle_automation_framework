const { test, expect } = require("@playwright/test");
const { HomePage } = require("../../pages/homePage");
const { ProductPage } = require("../../pages/ProductPage");

test.describe("Lifestyle E2E POM", () => {
  test("Search and Sort Products", async ({ page }) => {
    const homePage = new HomePage(page);

    await homePage.navigate();
    await homePage.dismissNotifications();
    await homePage.navigateToCasualShirts();
    await homePage.sortByPriceLowToHigh();

    // Specific assertion for price
    await expect(page.getByText("499", { exact: true }).nth(5)).toBeVisible();
  });

  test("Add product to cart via direct link", async ({ page }) => {
    const productPage = new ProductPage(page);
    const homePage = new HomePage(page);

    await page.goto(
      "https://www.lifestylestores.com/in/en/SHOP-Fame-Forever-Blue-FAME-FOREVER-Printed-Regular-Fit-Shirt-For-Men/p/1000014705758-Orange-Orange",
    );

    await homePage.dismissNotifications();
    await productPage.selectSizeL();
    await productPage.addToBasket();
    await productPage.goToCart();
    await expect(page).toHaveURL("https://www.lifestylestores.com/in/en/cart");
  });

  test("verify prompted to select size when adding to cart without selecting size", async ({
    page,
  }) => {
    const productPage = new ProductPage(page);
    const homePage = new HomePage(page);

    await page.goto(
      "https://www.lifestylestores.com/in/en/SHOP-Fame-Forever-Blue-FAME-FOREVER-Printed-Regular-Fit-Shirt-For-Men/p/1000014705758-Orange-Orange",
    );
    await homePage.dismissNotifications();
    await setTimeout(() => {}, 2000); // Wait for 2 seconds
    await page
      .locator("#notify-quantity")
      .getByRole("button", { name: "ADD TO BASKET" })
      .click();
    await page.getByRole("button", { name: "Don't Allow" }).click();
    await page.getByRole("button", { name: "L", exact: true }).click();
    await page.getByRole("button", { name: "ADD TO BASKET" }).click();
    await page.getByRole("button", { name: "cart-icon-" }).click();
    await expect(page.getByText("Colour:OrangeSize:L7 days")).toBeVisible();
    await expect(
      page.getByText(
        "FAME FOREVER Printed Regular Fit Shirt₹1299₹649₹650 savedSold By :Landmark",
      ),
    ).toBeVisible();
  });
});
