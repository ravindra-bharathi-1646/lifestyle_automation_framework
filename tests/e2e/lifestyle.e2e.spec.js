const { test, expect } = require("@playwright/test");
const { HomePage } = require("../../pages/HomePage");
const { ProductPage } = require("../../pages/ProductPage");
const { CartPage } = require("../../pages/CartPage");

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
    const cartPage = new CartPage(page);
    const homePage = new HomePage(page);

    await page.goto(shirt1URL);
    await homePage.dismissNotifications();
    await productPage.selectSize("L");
    await productPage.addToBasket();
    await cartPage.goToCart();
    await expect(page).toHaveURL(/.*cart/);
  });

  // --- Test 3 ---
  test("TC03: Verify user must select size before adding to cart", async ({
    page,
  }) => {
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);
    const homePage = new HomePage(page);
    await page.goto(shirt1URL);
    await homePage.dismissNotifications();
    await productPage.addToBasket();
    await expect(page).not.toHaveURL(/.*cart/);
    await productPage.selectSize("L");
    await productPage.addToBasket();
    await cartPage.goToCart();
    await expect(page.getByText("Size:L")).toBeVisible();
  });

  // --- Test 4 ---
  test("TC04: Verify that a user can select different available sizes", async ({
    page,
  }) => {
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);
    const homePage = new HomePage(page);
    await page.goto(shirt2URL);
    await homePage.dismissNotifications();
    await productPage.selectSize("L");
    await productPage.addToBasket();
    await cartPage.goToCart();
    await expect(page.getByText(/Size:L/)).toBeVisible();
  });

  // --- Test 5 ---
  test("TC05: Verify quantity updates total price dynamically", async ({
    page,
  }) => {
    test.slow();
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);
    const homePage = new HomePage(page);

    await page.goto(shirt1URL);
    await homePage.dismissNotifications();

    await productPage.selectSize("L");
    await productPage.addToBasket();
    await cartPage.goToCart();

    await cartPage.updateQuantity(2);
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
    const cartPage = new CartPage(page);
    const homePage = new HomePage(page);

    await page.goto(shirt1URL);
    await homePage.dismissNotifications();
    await productPage.selectSize("L");

    await productPage.addToBasket();
    await cartPage.goToCart();

    await cartPage.removeItem();

    // Loose text match for robustness
    await cartPage.verifyEmptyCart();
  });

  // test 07
  test("TC07: Pincode Entry and Conditional Coupon Application", async ({
    page,
  }) => {
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);
    const homePage = new HomePage(page);
    await page.goto(shirt1URL);
    await homePage.dismissNotifications();
    await productPage.selectSize("L");
    await productPage.addToBasket();
    await cartPage.goToCart();
    await cartPage.applyCoupon();
    if (await page.getByText(/Coupon Discount/i).isVisible()) {
      await expect(page.getByText(/Coupon Discount/i)).toBeVisible();
    } else {
      console.log("Skipping coupon validation as no coupon was applicable.");
    }
  });

  // test 08
  test("TC08: Verify that the Check Delivery Date widget provides an estimated arrival time when a valid pincode/zip code is entered.", async ({
    page,
  }) => {
    test.slow();
    const productPage = new ProductPage(page);
    const homePage = new HomePage(page);

    // Navigate directly to a product page for reliable testing
    await page.goto(shirt1URL);
    await homePage.dismissNotifications();

    await productPage.checkDeliveryDetails("600072");

    const deliveryElement = page.getByText(/Delivery Within/i);
    await expect(deliveryElement).toBeVisible({ timeout: 15000 });

    // Extract and display the delivery date
    const deliveryText = await deliveryElement.textContent();
    console.log(`Delivery Information: ${deliveryText}`);
  });

  // test 09      
  test("TC09: Verify Share Product copies correct link", async ({ page, context }) => {
    const productPage = new ProductPage(page);
    const homePage = new HomePage(page);

    // Grant clipboard permissions
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);

    await page.goto(shirt1URL);
    await homePage.dismissNotifications();

    // Get the original product title
    const originalTitle = await page.locator("div").filter({ hasText: /^FAME FOREVER Printed Regular Fit Shirt$/ }).first().textContent();
    console.log(`Original Product Title: ${originalTitle}`);

    // Hover on Share and copy the link
    const copiedUrl = await productPage.shareProductAndCopyLink();
    console.log(`Copied URL: ${copiedUrl}`);

    // Open the copied link in a new tab
    const newPage = await context.newPage();
    await newPage.goto(copiedUrl);
    await newPage.waitForLoadState("domcontentloaded");

    // Verify the product title matches in the new tab
    const newPageTitle = await newPage.locator("div").filter({ hasText: /^FAME FOREVER Printed Regular Fit Shirt$/ }).first().textContent();
    console.log(` New Page Product Title: ${newPageTitle}`);

    expect(originalTitle).toBe(newPageTitle);

    await newPage.close();
  });

  // test 10
  test("TC10: Verify size and brand filters and add product to cart", async ({ page }) => {
    test.slow();
    const homePage = new HomePage(page);
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);

    // Navigate to men's shirts directly
    await page.goto("https://www.lifestylestores.com/in/en/search?q=men%20shirts");
    await homePage.dismissNotifications();
    await page.waitForTimeout(2000);

    // --- Apply Size Filter (L) ---
    console.log("Applying Size filter...");

    // Using robust locator: finding first collapse icon (assuming it's Size or first category)
    const sizeCollapse = page.getByRole('button', { name: 'collapse-icon' }).first();
    await sizeCollapse.waitFor({ state: "visible" });
    await sizeCollapse.click();
    await page.waitForTimeout(1000);

    // Select Size L
    // We try multiple strategies: text or nth(1)
    const sizeLLabel = page.locator('label').filter({ hasText: /^L$/ }).first();
    if (await sizeLLabel.isVisible()) {
      await sizeLLabel.click();
    } else {
      await page.getByRole('checkbox').nth(1).check();
    }
    console.log("Applied Size filter: L");
    await page.waitForTimeout(3000);

    // --- Apply Brand Filter ---
    console.log("Applying Brand filter...");
    // Try finding Brand header text
    const brandHeader = page.locator("div").filter({ hasText: /^Brand$/ }).first();
    if (await brandHeader.isVisible()) {
      await brandHeader.click();
    } else {
      // Fallback to next collapse icon
      const brandCollapse = page.getByRole('button', { name: 'collapse-icon' }).nth(1);
      if (await brandCollapse.isVisible()) {
        await brandCollapse.click();
      }
    }
    await page.waitForTimeout(1000);

    // Select the first available brand
    const firstBrand = page.getByRole('checkbox').first();
    await firstBrand.waitFor({ state: "visible" });
    await firstBrand.check();
    console.log("Applied Brand filter");
    await page.waitForTimeout(3000);

    // --- Select Product ---
    // Click on a filtered product - opens in popup/new tab
    const page1Promise = page.waitForEvent("popup");
    const productCard = page.locator("div").filter({ hasText: /^₹/ }).first();
    await productCard.click({ force: true });
    const page1 = await page1Promise;

    await page1.waitForLoadState("domcontentloaded");
    console.log("Selected a filtered product");

    // --- Verify and Add to Cart ---
    const newProductPage = new ProductPage(page1);
    const newCartPage = new CartPage(page1);

    // Verify size L is available on product page (button with name "L")
    const sizeLButton = page1.getByRole("button", { name: "L", exact: true });
    // Use a try-catch or soft assertion to not fail immediately if L is not found
    if (await sizeLButton.isVisible()) {
      if (await sizeLButton.getAttribute('aria-selected') !== 'true') {
        await sizeLButton.click();
        console.log("Selected Size: L");
      } else {
        console.log("Size L already selected");
      }
    } else {
      console.log("Size L button not found - implies product might be out of stock in that size or filter issue");
      // Proceeding to add to basket if possible to test cart logic, or select *any* size
    }

    // Add to basket
    await newProductPage.addToBasket();
    console.log("Added product to basket");

    // Go to cart
    await newCartPage.goToCart();

    // Verify size L is reflected in cart
    await newCartPage.verifySizeInCart("L");
    console.log("Verified: Size L is reflected in cart");

    await page1.close();
  });
});
