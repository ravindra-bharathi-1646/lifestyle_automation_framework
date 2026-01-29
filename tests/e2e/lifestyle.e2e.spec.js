const { test, expect } = require("@playwright/test");
const { HomePage } = require("../../pages/homePage");
const { ProductPage } = require("../../pages/ProductPage");

test.describe("Lifestyle E2E POM Suite", () => {
  const shirt1URL =
    "https://www.lifestylestores.com/in/en/SHOP-Fame-Forever-Blue-FAME-FOREVER-Printed-Regular-Fit-Shirt-For-Men/p/1000014705758-Orange-Orange";
  const shirt2URL =
    "https://www.lifestylestores.com/in/en/SHOP-Fame-Forever-Beige-FAME-FOREVER-Solid-Slim-Fit-Shirt-For-Men/p/1000014028724-White-White";
  // Test 1: Navigation and Sorting
  test("Select from categories and sort products", async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();
    await homePage.dismissNotifications();
    await homePage.navigateToCasualShirts();
    await homePage.sortByPriceLowToHigh();

    await expect(page.getByText("499", { exact: true }).nth(5)).toBeVisible();
  });

  // Test 2: Standard Add to Cart
  test("Add product to cart via direct link", async ({ page }) => {
    const productPage = new ProductPage(page);
    const homePage = new HomePage(page);

    await page.goto(shirt1URL);
    await homePage.dismissNotifications();
    await productPage.selectSize("L");
    await productPage.addToBasket();
    await productPage.goToCart();
    await expect(page).toHaveURL("https://www.lifestylestores.com/in/en/cart");
  });

  // Test 3: Validation Check (The "Select Size" behavior)
  test("Verify user must select size before adding to cart", async ({
    page,
  }) => {
    const productPage = new ProductPage(page);
    const homePage = new HomePage(page);

    await page.goto(shirt1URL);
    await homePage.dismissNotifications();

    // Click without selecting size
    await productPage.addToBasket();

    // Verify we stayed on the product page (navigation didn't happen)
    await expect(page).not.toHaveURL(
      "https://www.lifestylestores.com/in/en/cart",
    );

    // Now select size and confirm it works
    await productPage.selectSize("L");
    await productPage.addToBasket();
    await productPage.goToCart();
    await expect(page.getByText("Size:L")).toBeVisible();
  });

  // Test 4: Testing Multiple Sizes
  test("Verify that a user can select different available sizes", async ({
    page,
  }) => {
    const productPage = new ProductPage(page);
    const homePage = new HomePage(page);

    // Test Size L
    await page.goto(shirt2URL);
    await homePage.dismissNotifications();
    await productPage.selectSize("L");
    await productPage.addToBasket();
    await productPage.goToCart();
    await expect(page.getByText(/Size:L/)).toBeVisible();

    // Test Size M (returning to product page)
    await page.goto(shirt2URL);
    await productPage.selectSize("M");
    await productPage.addToBasket();
    await productPage.goToCart();
    await expect(page.getByText(/Size:M/)).toBeVisible();
  });

  test("Verify increase the quantity of an item in the basket updates dynamically", async ({
    page,
  }) => {
    await page.goto(shirt1URL);
    const productPage = new ProductPage(page);
    const homePage = new HomePage(page);
    await homePage.dismissNotifications();
    await productPage.selectSize("L");
    await productPage.addToBasket();
    await productPage.goToCart();
    await page.getByText("Qty: 1▼").click();
    await page.getByText("2", { exact: true }).click();
    await page.getByRole("button", { name: "SELECT" }).click();
    await expect(
      page.locator("div").filter({ hasText: /^₹2598$/ }),
    ).toBeVisible();
    await page.getByText("▼").click();
    await page.getByText("3", { exact: true }).click();
    await page.getByRole("button", { name: "SELECT" }).click();
    await expect(
      page.locator("div").filter({ hasText: /^₹3897$/ }),
    ).toBeVisible();
    await page.getByText("Qty: 3▼").click();
    await page.getByText("4", { exact: true }).click();
    await page.getByRole("button", { name: "SELECT" }).click();
    await expect(
      page.locator("div").filter({ hasText: /^₹5196$/ }),
    ).toBeVisible();
  });
});
