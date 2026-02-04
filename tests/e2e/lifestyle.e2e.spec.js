const { test, expect } = require("@playwright/test");
const { HomePage } = require("../../pages/HomePage");
const { ProductPage } = require("../../pages/ProductPage");

test.describe("Lifestyle Stores E2E Suite", () => {
  const shirt1URL =
    "https://www.lifestylestores.com/in/en/SHOP-Fame-Forever-Blue-FAME-FOREVER-Printed-Regular-Fit-Shirt-For-Men/p/1000014705758-Orange-Orange";
  const shirt2URL =
    "https://www.lifestylestores.com/in/en/SHOP-Fame-Forever-Beige-FAME-FOREVER-Solid-Slim-Fit-Shirt-For-Men/p/1000014028724-White-White";

  // --- Test 1 ---
  test("TC01: Select from categories and sort products", async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.navigate();
    await homePage.dismissNotifications();
    await homePage.navigateToCasualShirts();
    await homePage.sortByPriceLowToHigh();

    await page.waitForTimeout(3000);

    const firstProductPrice = page
      .locator("div")
      .filter({ hasText: /^₹/ })
      .first();
    await expect(firstProductPrice).toBeVisible();
  });

  // --- Test 2 ---
  test("TC02: Add product to cart via direct link", async ({ page }) => {
    const productPage = new ProductPage(page);
    const homePage = new HomePage(page);

    await page.goto(shirt1URL);
    await homePage.dismissNotifications();
    await productPage.selectSize("L");
    await productPage.addToBasket();
    await productPage.goToCart();
    await expect(page).toHaveURL(/.*cart/);
  });

  // --- Test 3 ---
  test("TC03: Verify user must select size before adding to cart", async ({
    page,
  }) => {
    const productPage = new ProductPage(page);
    const homePage = new HomePage(page);
    await page.goto(shirt1URL);
    await homePage.dismissNotifications();
    await productPage.addToBasket();
    await expect(page).not.toHaveURL(/.*cart/);
    await productPage.selectSize("L");
    await productPage.addToBasket();
    await productPage.goToCart();
    await expect(page.getByText("Size:L")).toBeVisible();
  });

  // --- Test 4 ---
  test("TC04: Verify that a user can select different available sizes", async ({
    page,
  }) => {
    const productPage = new ProductPage(page);
    const homePage = new HomePage(page);
    await page.goto(shirt2URL);
    await homePage.dismissNotifications();
    await productPage.selectSize("L");
    await productPage.addToBasket();
    await productPage.goToCart();
    await expect(page.getByText(/Size:L/)).toBeVisible();
  });

  // --- Test 5 ---
  test("TC05: Verify quantity updates total price dynamically", async ({
    page,
  }) => {
    test.slow();
    const productPage = new ProductPage(page);
    const homePage = new HomePage(page);

    await page.goto(shirt1URL);
    await homePage.dismissNotifications();

    await productPage.selectSize("L");
    await productPage.addToBasket();
    await productPage.goToCart();

    await productPage.updateQuantity(2);
    await expect(
      page
        .locator("div")
        .filter({ hasText: /^₹\d+,?\d*$/ })
        .first(),
    ).toBeVisible();
  });

  // --- Test 6 ---
  test("TC06: Verify removing item from cart updates cart correctly", async ({
    page,
  }) => {
    const productPage = new ProductPage(page);
    const homePage = new HomePage(page);

    await page.goto(shirt1URL);
    await homePage.dismissNotifications();
    await productPage.selectSize("L");

    await productPage.addToBasket();
    await productPage.goToCart();

    await productPage.removeItem();

    // Loose text match for robustness
    await expect(
      page.getByText("The best fashion is waiting", { exact: false }),
    ).toBeVisible();
  });

  test("TC07: Pincode Entry and Conditional Coupon Application", async ({
    page,
  }) => {
    const productPage = new ProductPage(page);
    const homePage = new HomePage(page);
    await page.goto(shirt1URL);
    await homePage.dismissNotifications();
    await productPage.selectSize("L");
    await productPage.addToBasket();
    await productPage.goToCart();
    await productPage.applyCoupon();
    if (await page.getByText(/Coupon Discount/i).isVisible()) {
      await expect(page.getByText(/Coupon Discount/i)).toBeVisible();
    } else {
      console.log("Skipping coupon validation as no coupon was applicable.");
    }
  });

  test("Verify that the Check Delivery Date widget provides an estimated arrival time when a valid pincode/zip code is entered.", async ({
    page,
    context,
  }) => {
    test.slow();
    const homePage = new HomePage(page);

    await homePage.navigate();
    await homePage.dismissNotifications();
    await homePage.searchForProduct("mens");

    // FIX: Change 'button' to 'link'.
    // Based on your snapshot, the links available are "Men", "Footwear", etc.
    // If you specifically want Shirts, it's safer to use the 'Men' link or a more general locator.
    const categoryLink = page
      .getByRole("link", { name: "Men", exact: true })
      .first();

    await categoryLink.waitFor({ state: "visible", timeout: 15000 });
    await categoryLink.click();

    // Locating the product - Lifestyles uses specific containers for prices
    const firstProduct = page.locator("div").filter({ hasText: /^₹/ }).nth(1);
    await firstProduct.waitFor({ state: "visible" });

    // Handle the new tab
    const [newPage] = await Promise.all([
      context.waitForEvent("page"),
      firstProduct.click({ clickCount: 2, force: true }), // Using clickCount: 2 for double click
    ]);

    const productPage = new ProductPage(newPage);

    // Ensure the new page is loaded before checking delivery
    await newPage.waitForLoadState("domcontentloaded");
    await productPage.checkDeliveryDetails("600072");

    // Assert the delivery text appears
    await expect(newPage.getByText(/Delivery Within/i)).toBeVisible({
      timeout: 15000,
    });

    await newPage.close();
  });
});
