class ListingPage {
    constructor(page) {
        this.page = page;
    }

    async expandFilter(index = 0) {
        await this.page.getByRole('button', { name: 'collapse-icon' }).nth(index).click();
    }

    async applyCheckboxFilter(index = 1) {
        await this.page.getByRole('checkbox').nth(index).check();
    }

    async clickFilterButton(name) {
        await this.page.getByRole('button', { name: name }).click();
    }

    async selectProductById(productId) {
        const productLocator = this.page.locator(`#product-${productId}`);
        const relativeLink = await productLocator.locator('a').first().getAttribute('href');
        const absoluteLink = new URL(relativeLink, 'https://www.lifestylestores.com/in/en/').href;
        await this.page.goto(absoluteLink);
        return absoluteLink;
    }
}

module.exports = { ListingPage };
