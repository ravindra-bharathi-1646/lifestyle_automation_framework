class FavouritesPage {
    constructor(page) {
        this.page = page;
    }

    async verifyProductVisible(productName) {
        await this.page.getByText(productName).first().waitFor({ state: "visible" });
    }

    async removeItem(index = 0) {
        await this.page
            .getByRole("button", { name: "remove item from favourites" })
            .nth(index)
            .click();
    }

    async verifyProductHidden(productName) {
        await this.page.getByText(productName).first().waitFor({ state: "hidden" });
    }
}
module.exports = { FavouritesPage };
