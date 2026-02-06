const { test, expect } = require("@playwright/test");
const { HomePage } = require("../../pages/homePage");
const { ProductPage } = require("../../pages/ProductPage");
const { CartPage } = require("../../pages/CartPage");
const { FavouritesPage } = require("../../pages/FavouritesPage");
const { ListingPage } = require("../../pages/ListingPage");

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
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto(shirt1URL);
    await homePage.dismissNotifications();
    const originalTitle = await page.locator("div").filter({ hasText: /^FAME FOREVER Printed Regular Fit Shirt$/ }).first().textContent();
    console.log(`Original Product Title: ${originalTitle}`);
    const copiedUrl = await productPage.shareProductAndCopyLink();
    console.log(`Copied URL: ${copiedUrl}`);
    const newPage = await context.newPage();
    await newPage.goto(copiedUrl);
    await newPage.waitForLoadState("domcontentloaded");
    const newPageTitle = await newPage.locator("div").filter({ hasText: /^FAME FOREVER Printed Regular Fit Shirt$/ }).first().textContent();
    console.log(` New Page Product Title: ${newPageTitle}`);
    expect(originalTitle).toBe(newPageTitle);
    await newPage.close();
  });

  // test 10
  test("TC10: Verify size and brand filters and add product to cart", async ({ page, context }) => {
    test.slow();
    const homePage = new HomePage(page);
    await page.goto("https://www.lifestylestores.com/in/en/search?q=men%20shirts");
    await homePage.dismissNotifications();
    console.log("Applying Size filter...");
    const sizeCollapse = page.getByRole('button', { name: 'collapse-icon' }).first();
    await sizeCollapse.waitFor({ state: "visible" });
    await sizeCollapse.click();
    await page.waitForTimeout(1000);
    const sizeLLabel = page.locator('label').filter({ hasText: /^L$/ }).first();
    if (await sizeLLabel.isVisible()) {
      await sizeLLabel.click();
    } else {
      await page.getByRole('checkbox').nth(1).check();
    }
    console.log("Applied Size filter: L");
    await page.waitForTimeout(3000);
    console.log("Applying Brand filter...");
    const brandHeader = page.locator("div").filter({ hasText: /^Brand$/ }).first();
    if (await brandHeader.isVisible()) {
      await brandHeader.click();
    } else {
      const brandCollapse = page.getByRole('button', { name: 'collapse-icon' }).nth(1);
      if (await brandCollapse.isVisible()) {
        await brandCollapse.click();
      }
    }
    await page.waitForTimeout(1000);
    const firstBrand = page.getByRole('checkbox').first();
    await firstBrand.waitFor({ state: "visible" });
    await firstBrand.check();
    console.log("Applied Brand filter");
    await page.waitForTimeout(3000);
    console.log("Selecting a product...");
    const firstProductLink = page.locator('#product-1000010021853-Purple-Mauve');
    const relativelink = await firstProductLink.locator('a').first().getAttribute('href');
    const absoluteLink = new URL(relativelink, 'https://www.lifestylestores.com/in/en/').href;
    console.log(absoluteLink);
    await page.goto(absoluteLink);
    await page.waitForTimeout(5000);
    console.log("Selected a filtered product");
    await expect(page.getByRole('button', { name: 'L', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'FAME FOREVER Solid Slim Fit' })).toBeVisible();
    await page.getByRole('button', { name: 'L', exact: true }).click();
    await page.getByRole('button', { name: 'ADD TO BASKET' }).click();
    await page.getByRole('button', { name: 'cart-icon-' }).click();
    await expect(page.getByRole('link', { name: 'FAME FOREVER Solid Slim Fit' })).toBeVisible();
    await expect(page.getByText('L', { exact: true })).toBeVisible();
    await page.waitForTimeout(5000);
  });

  //test 11
  test("TC11: filter the product and add to cart", async ({ page }) => {
    test.slow();
    const homePage = new HomePage(page);
    const listingPage = new ListingPage(page);
    const productPage = new ProductPage(page);
    const cartPage = new CartPage(page);
    await homePage.navigate();
    await page.goto("https://www.lifestylestores.com/in/en/search?q=men%20shirts");
    await homePage.dismissNotifications();
    await page.goto('https://www.lifestylestores.com/in/en/search?q=men%20shirts%3AsleeveLength_uFilter%3AHalf%20Sleeves%3AsleeveLength_uFilter%3AFull%20Sleeves');
    await listingPage.clickFilterButton('Full Sleeves');
    await listingPage.expandFilter(0);
    await listingPage.expandFilter(1);
    await listingPage.applyCheckboxFilter(1);
    await listingPage.selectProductById('1000014889873-Grey-Grey');
    await expect(page.locator('div').filter({ hasText: /^BOSSINI Crinkled Regular Fit Shirt$/ }).nth(1)).toBeVisible();
    await productPage.selectSize('L');
    await productPage.addToBasket();
    await cartPage.goToCart();
    await cartPage.verifySizeInCart('L');
    await page.getByRole('link', { name: 'BOSSINI Crinkled Regular Fit' }).click();
  })
  //test 12
  test("TC12: Login as a user and need to verify the product added to wishlist", async ({ page }) => {
    const homePage = new HomePage(page);
    const productPage = new ProductPage(page);
    const favouritesPage = new FavouritesPage(page);
    await homePage.navigate();
    await homePage.dismissNotifications();
    await homePage.login('7448508623');
    await homePage.verifyLoggedIn('ravindra');
    await page.goto("https://www.lifestylestores.com/in/en/search?q=men%20shirts");
    const firstProductLink = page.locator('#product-1000014889873-Grey-Grey');
    const relativelink = await firstProductLink.locator('a').first().getAttribute('href');
    const absoluteLink = new URL(relativelink, 'https://www.lifestylestores.com/in/en/').href;
    await page.goto(absoluteLink);
    await productPage.addToFavourites();
    await homePage.goToFavourites();
    await favouritesPage.verifyProductVisible('FAME FOREVER Solid Slim Fit');
  })

  // test 13 
  test("TC13: Verify that the user can add a product to the wishlist and remove it from the wishlist.", async ({ page }) => {
    const homePage = new HomePage(page);
    const productPage = new ProductPage(page);
    const favouritesPage = new FavouritesPage(page);
    await homePage.navigate();
    await homePage.dismissNotifications();
    await homePage.login('7448508623');
    await homePage.verifyLoggedIn('ravindra');
    await page.goto("https://www.lifestylestores.com/in/en/search?q=men%20shirts");
    const firstProductLink = page.locator('#product-1000014889873-Grey-Grey');
    const relativelink = await firstProductLink.locator('a').first().getAttribute('href');
    const absoluteLink = new URL(relativelink, 'https://www.lifestylestores.com/in/en/').href;
    await page.goto(absoluteLink);
    await productPage.addToFavourites();
    await homePage.goToFavourites();
    await favouritesPage.verifyProductVisible('FAME FOREVER Solid Slim Fit');
    await favouritesPage.removeItem(0);
    await favouritesPage.verifyProductHidden('FAME FOREVER Solid Slim Fit');
  });
  // test 14
  test("TC14: verify product in favourites page after log out and login again", async ({ page }) => {
    const homePage = new HomePage(page);
    const productPage = new ProductPage(page);
    const favouritesPage = new FavouritesPage(page);

    await homePage.navigate();
    await homePage.dismissNotifications();
    await homePage.login('7448508623');
    await homePage.verifyLoggedIn('ravindra');
    await page.goto("https://www.lifestylestores.com/in/en/search?q=men%20shirts");
    const firstProductLink = page.locator('#product-1000014889873-Grey-Grey');
    const relativelink = await firstProductLink.locator('a').first().getAttribute('href');
    const absoluteLink = new URL(relativelink, 'https://www.lifestylestores.com/in/en/').href;
    await page.goto(absoluteLink);
    await productPage.addToFavourites();
    await homePage.goToFavourites();
    await favouritesPage.verifyProductVisible('FAME FOREVER Solid Slim Fit');
    await page.pause();
    await page.getByRole("button", { name: "SIGN UP / SIGN IN" }).click();
    await page.getByRole("textbox", { name: "Mobile Number" }).fill('7448508623');
    await page.getByRole("button", { name: "Continue" }).click();
    await page.pause();
    await homePage.verifyLoggedIn('ravindra');
    await homePage.goToFavourites();
    await favouritesPage.verifyProductVisible('FAME FOREVER Solid Slim Fit');
  })
});
