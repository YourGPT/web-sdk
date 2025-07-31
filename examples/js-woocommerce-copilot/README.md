# Widget AI Action for WooCommerce

Let's transform your WooCommerce store with YourGPT's AI Copilot! This guide shows you how to create seamless, automated interactions between your chatbot and store frontend.

Before integrating the YourGPT chatbot, ensure you have a local WordPress and WooCommerce environment ready. We provide a pre-configured theme via Git that you can download and apply to quickly set up the store for seamless chatbot integration.

### ⚡ Quick Implementation

Simply add this PHP function to your theme's `functions.php` or custom plugin to inject the required JavaScript into your site's footer. This establishes all the necessary connections for product search, cart management, and checkout automation.


## Features

- **Product Search**: Customers can find products using natural language queries
- **Product Filtering**: Filter products by price range and other attributes
- **Product Viewing**: Navigate to specific product pages through conversation
- **Cart Management**: Add products to cart, view cart contents, and proceed to checkout
- **Order History**: Access and repeat previous orders
- **Variant Selection**: Choose product variants through conversation
- **Quantity Management**: Specify product quantities when adding to cart

## Installation

1. Download the plugin zip file
2. Go to your WordPress admin dashboard
3. Navigate to Plugins > Add New
4. Click on "Upload Plugin" and select the downloaded zip file
5. Click "Install Now" and then "Activate Plugin"
6. Ensure WooCommerce is installed and activated

## Configuration

The plugin comes pre-configured with a default YourGPT widget ID. To customize or use your own YourGPT chatbot:

1. Sign up at [YourGPT.ai](https://yourgpt.ai/)
2. Create and configure your chatbot
3. Replace the `YGC_WIDGET_ID` in the plugin code with your own widget ID

## Usage

Once installed and activated, the YourGPT chatbot widget will automatically appear on your WooCommerce store. Customers can interact with it using natural language commands such as:

- "Show me all products"
- "Find pasta dishes under $15"
- "Add spaghetti to my cart"
- "View my cart"
- "Proceed to checkout"
- "Show my previous orders"
- "Repeat my last order"

### 🔄 Dynamic URL Handling

The magic happens through the `WOOCOMMERCE_URLS` object that dynamically generates correct URLs using WordPress functions. This ensures your chatbot works perfectly across all environments without hardcoded URLs.

**Example:**

```jsx
const WOOCOMMERCE_URLS = {
  site: '<?php echo esc_url(home_url('/')); ?>',
  shop: '<?php echo esc_url(get_permalink(wc_get_page_id('shop'))); ?>',
  cart: '<?php echo esc_url(wc_get_cart_url()); ?>',
  my_account: '<?php echo esc_url(get_permalink(get_option('woocommerce_myaccount_page_id'))); ?>'
};
```

### 🔌 Installation

Add this PHP function to your theme's `functions.php` file or a custom plugin:

```jsx
function add_yourgpt_chatbot_script() {
?>
<script>
window.YGC_WIDGET_ID = "YOUR_WIDGET_ID";
(function() {
    var script = document.createElement('script');
    script.src = "https://widget.yourgpt.ai/script.js";
    script.id = 'yourgpt-chatbot';
    document.body.appendChild(script);
    
    script.onload = function() {
        if (window.$yourgptChatbot) {
            $yourgptChatbot.on("ai:action:show_all_products", async (data, action) => {
                // Starts handling the 'show all products' action...
                // Implementation goes here...
            });
            
            $yourgptChatbot.on("ai:action:view_cart", (data, action) => {
                // Starts handling the 'view cart' action...
                // Implementation goes here...
            });
        }
    };
})();
</script>
<?php
}
add_action('wp_footer', 'add_yourgpt_chatbot_script');
```

## Core AI Actions

Here are the specific AI actions the script is configured to handle:

### 1. 🏪 Show All Products

- **Action:** **`ai:action:show_all_products`**
- **Summary:** Redirects the user from their current page to the main WooCommerce shop page to browse all products.

```jsx
$yourgptChatbot.on("ai:action:show_all_products", (data, action) => {
    action.respond("Redirecting to the shop page...");
    *// WOOCOMMERCE_URLS.shop is dynamically set to your shop's URL*
    // window.location.href = "http://localhost/wordpress/wordpress/index.php/shop/";
    window.location.href = WOOCOMMERCE_URLS.shop;
    action.respond("Redirecting to all products...")
});
```

![Screenshot From 2025-07-31 16-10-36.png](assets/Screenshot_From_2025-07-31_16-10-36.png)

### 2. 🔍 Find/Search for a Product

- **Action:** **`ai:action:find_item`**
- **Summary:** Takes a search query from the user (e.g., "find me a coke"), constructs a WooCommerce product search URL, and redirects the user to the search results page.

> *Important: For the `ai:action:find_item` action, provide the search term as a parameter in the function arguments. In our example, it’s shown as `searchedItem`*
> 

![Screenshot From 2025-07-31 17-14-09.png](assets/Screenshot_From_2025-07-31_17-14-09.png)

```jsx
$yourgptChatbot.on("ai:action:find_item", async (data, action) => {
    *// Parses arguments like { "*searchedItem*": "coke" } from the chatbot*
    const args = JSON.parse(data.action.tool.function.arguments);
    const searchQuery = args.searchedItem || args.query;

    action.respond(`Searching for "${searchQuery}"...`);
    *// Redirects to a URL like: https://yourstore.com/?s=coke&post_type=product*
    window.location.href = `${WOOCOMMERCE_URLS.site}?s=${encodeURIComponent(searchQuery)}&post_type=product`;
});
```

![Screenshot From 2025-07-31 13-34-17.png](assets/Screenshot_From_2025-07-31_13-34-17.png)

### 3. 💰 Filter Products by Price

- **Action:** **`ai:action:filter_items`**
- **Summary:** Applies price filters to the shop page. It takes a minimum and/or maximum price and reloads the shop page with the appropriate URL parameters.

> *Important: For the `ai:action:filter_items` action, provide the minimum and maximum price as parameters in the function arguments. In our example, they’re shown as `min` and `max`***.**
> 

```jsx
$yourgptChatbot.on("ai:action:filter_items", async (data, action) => {
    *// Parses arguments like { "min": 10, "max": 50 }*
    const { min, max } = JSON.parse(data.action.tool.function.arguments);
    
    const filterUrl = new URL(WOOCOMMERCE_URLS.shop);
    if (min) filterUrl.searchParams.set('min_price', min);
    if (max) filterUrl.searchParams.set('max_price', max);
    action.respond(`Filtering products between ${min} and ${max}.`);
    window.location.href = filterUrl.href;
});
```

![Screenshot From 2025-07-31 15-08-21.png](assets/Screenshot_From_2025-07-31_15-08-21.png)

### 4. 👁️ View a Specific Product

- **Action:** **`ai:action:view_product`**
- **Summary:** From a listing page, this action finds the most similar product matching the user's request and navigates directly to that product's detail page.

> *Important: For the `ai:action:find_item` action, provide the search term as a parameter in the function arguments. In our example, it’s shown as `s`*
> 

```jsx
$yourgptChatbot.on("ai:action:view_product", (data, action) => {
    *// Parses arguments like { "productName": "diet coke" }*
    const args = JSON.parse(data.action.tool.function.arguments);
    const productQuery = args.s || args.productName;
    
    *// Scans all product links on the current page*
    const productLinks = document.querySelectorAll('a[href*="/product/"]');
    const allSlugs = Array.from(productLinks).map(link => link.href.split('/product/')[1]);
    
    *// Finds the best match and redirects*
    const bestMatchSlug = findMostSimilar(productQuery, allSlugs); *// Uses helper function*
    
    if (bestMatchSlug) {
        action.respond(`Redirecting to the page for ${productQuery}.`);
        window.location.href = `${WOOCOMMERCE_URLS.site}product/${bestMatchSlug}`;
    }
});
```

- **Helper Function for `view_product`**
    
    ```jsx
    **findMostSimilar(query, items)**
    ```
    
    - **Summary:** This utility function takes a user's search query (e.g., "show me the diet coke") and a list of available product slugs from the current page. It intelligently scores each product based on how well it matches the query—prioritizing exact matches, then phrase matches, and finally partial word matches—to return the best possible result.
    
    ```jsx
    function findMostSimilar(query, items) {
        if (!query || !items || items.length === 0) return null;
    
        *// Normalize query and remove common action words*
        const queryNormalized = query.toLowerCase().replace(/-/g, ' ');
        const queryWords = queryNormalized.split(' ').filter(word =>
            !['open', 'show', 'find', 'get', 'view'].includes(word)
        );
    
        let bestMatch = null;
        let bestScore = -1; *// Use -1 to ensure any match is selected*
    
        for (let item of items) {
            if (!item) continue;
    
            const productName = item.split('?')[0].replace(/-/g, ' ').replace(/\/$/, '').toLowerCase();
            let score = 0;
    
            *// Score based on match quality*
            if (productName === queryNormalized) {
                score = 1000; *// Exact match is best*
            } else if (productName.includes(queryNormalized)) {
                score = 100; *// Contains the full phrase*
            } else {
                *// Partial word match*
                queryWords.forEach(word => {
                    if (productName.includes(word)) {
                        score += 10;
                    }
                });
            }
    
            if (score > bestScore) {
                bestScore = score;
                bestMatch = item;
            }
        }
        return bestMatch;
    }
    ```
    

### 5. 🛒 Add Product to Cart

- **Action:** **`ai:action:add_to_cart`**
- **Summary:** A multi-functional action that handles adding products to the cart from either a product detail page or a listing page. It can manage quantity and select product variations.
    - **On a product page:** It sets the quantity, selects a variant if specified, and clicks the "Add to Cart" button.
    - **On a listing page:** It finds the product and clicks its "Add to Cart" button. If the product has options (is a variable product), it redirects to the product page.

> *Important: For the `ai:action:add_to_cart` action, provide product details such as `productName`, optional `qty` (quantity), and optionally `variant`  in the widget AI function.*
> 

```jsx
$yourgptChatbot.on("ai:action:add_to_cart", async (data, action) => {
    *// Parses arguments like { "productName": "V-Neck T-Shirt", "qty": 2, "variant": "Blue" }*
    const { productName, qty = 1, variant } = JSON.parse(data.action.tool.function.arguments);

    *// Checks if the user is currently on a single product page*
    if (window.location.href.includes('/product/')) {
        *// Handle variant selection if needed*
        if (variant) {
            await selectVariantOption(variant); *// Uses helper function*
        }
        *// Set quantity*
        document.querySelector('.quantity .qty').value = qty;
        *// Click the main add to cart button*
        document.querySelector(".single_add_to_cart_button").click();
        action.respond("Product added to your cart!");
    } else {
        *// On a listing page, find the product and add it*
        const result = await clickAddToCartOnListing(productName); *// Uses helper function*
        if (result.success && !result.redirecting) {
            action.respond("Product added to your cart!");
        } else if (result.success && result.redirecting) {
            action.respond("This product has options. Taking you to the product page to choose them.");
        }
    }
});

```

- **Helper Functions for `add_to_cart`**
    
    ```jsx
    **selectVariantOption(variantText)**
    ```
    
    - **Summary:** On a product page, this function finds a specific product option (e.g., 'Blue', 'Large') in a dropdown menu and selects it, triggering any necessary price or image updates on the page.
    
    ```jsx
    async function selectVariantOption(variantText) {
        const selectElement = document.querySelector('table.variations select');
        if (!selectElement) return { success: false };
    
        const matchedOption = Array.from(selectElement.options).find(opt =>
            opt.text.toLowerCase().includes(variantText.toLowerCase())
        );
    
        if (matchedOption && matchedOption.value) {
            selectElement.value = matchedOption.value;
            selectElement.dispatchEvent(new Event('change', { bubbles: true }));
            *// Wait a moment for WooCommerce to update the UI*
            await new Promise(resolve => setTimeout(resolve, 300));
            return { success: true };
        }
        return { success: false };
    }
    ```
    
    ```jsx
    **clickAddToCartOnListing(productName)**
    ```
    
    - **Summary:** On a shop or category page, this function searches for a product by its name. If it's a simple product, it clicks the 'add to cart' button directly. If it's a variable product (with options like color or size), it redirects the user to the product's detail page to make their selections.
    
    ```jsx
    async function clickAddToCartOnListing(productName) {
        const productLinks = Array.from(document.querySelectorAll('.products li .woocommerce-loop-product__link'));
        const targetLink = productLinks.find(link => link.textContent.trim().toLowerCase() === productName.toLowerCase());
        const productContainer = targetLink ? targetLink.closest('li') : null;
    
        if (!productContainer) return { success: false };
    
        const addToCartButton = productContainer.querySelector('.add_to_cart_button');
        if (!addToCartButton) return { success: false };
        
        *// If it's a variable product, redirect to its page*
        if (addToCartButton.classList.contains('product_type_variable')) {
            window.location.href = targetLink.href;
            return { success: true, redirecting: true };
        }
        
        *// Otherwise, click the button to add it*
        addToCartButton.click();
        return { success: true, redirecting: false };
    }
    ```
    

![Screenshot From 2025-07-31 15-19-43.png](assets/Screenshot_From_2025-07-31_15-19-43.png)

### 6. 🛍️ View Cart

- **Action:** **`ai:action:view_cart`**
- **Summary:** Redirects the user to the cart page to review their items.

```jsx
$yourgptChatbot.on("ai:action:view_cart", (data, action) => {
    action.respond("Opening the cart...");
    window.location.href = WOOCOMMERCE_URLS.cart;
});
```

![Screenshot From 2025-07-31 15-31-10.png](assets/Screenshot_From_2025-07-31_15-31-10.png)

### 7. 💳 Proceed to Checkout

- **Action:** **`ai:action:checkout_cart`**
- **Summary:** From the cart page, this action clicks the "Proceed to Checkout" button to move the user to the checkout page.

```jsx
$yourgptChatbot.on("ai:action:checkout_cart", (data, action) => {
    action.respond("Proceeding to checkout...");
    const checkoutButton = document.querySelector('.checkout-button, a.checkout-button');
    if (checkoutButton) {
        checkoutButton.click();
    }
});
```

![Screenshot From 2025-07-31 15-35-54.png](assets/Screenshot_From_2025-07-31_15-35-54.png)

### 8. 📋 View Orders

- **Action:** **`ai:action:get_all_orders`**
- **Summary:** Redirects the user to their "My Account -> Orders" page to see their order history.

```jsx
$yourgptChatbot.on("ai:action:get_all_orders", (data, action) => {
    action.respond("Redirecting to your orders page...");
    window.location.href = WOOCOMMERCE_URLS.orders;
});
```

### 9. 🔄 Repeat Last Order

- **Action:** **`ai:action:repeat_order`**
- **Summary:** This complex action automates re-ordering. It fetches the user's order history, finds the most recent order, identifies the first product in it, and then navigates to that product's page with parameters to automatically add it to the cart.

```jsx
$yourgptChatbot.on("ai:action:repeat_order", async (data, action) => {
    action.respond("Checking your last order...");
    *// 1. Fetch the main orders page*
    const ordersResponse = await fetch(WOOCOMMERCE_URLS.orders);
    const ordersHtml = await ordersResponse.text();
    const ordersDoc = new DOMParser().parseFromString(ordersHtml, 'text/html');
    
    *// 2. Find the link to the latest order*
    const latestOrderLink = ordersDoc.querySelector('a.woocommerce-button.view');
    if (!latestOrderLink) {
        return action.respond("You don't have any previous orders.");
    }

    *// 3. Fetch the order detail page*
    const orderDetailResponse = await fetch(latestOrderLink.href);
    const orderDetailHtml = await orderDetailResponse.text();
    const orderDoc = new DOMParser().parseFromString(orderDetailHtml, 'text/html');
    
    *// 4. Extract product URL and quantity from the order details*
    const productUrl = orderDoc.querySelector('td.woocommerce-table__product-name a')?.href;
    const quantityText = orderDoc.querySelector('.product-quantity')?.innerText.replace(/[^\d]/g, '') || '1';

    *// 5. Redirect to the product page with parameters to trigger the re-order*
    const repeatUrl = new URL(productUrl);
    repeatUrl.searchParams.set('repeat_order', 'true');
    repeatUrl.searchParams.set('quantity', quantityText);

    action.respond("Found your last order item. Adding it to your cart now...");
    window.location.href = repeatUrl.href;
});
```
---

## 📄 License
MIT License - see LICENSE file for details.

## 🆘 Support
- 📧 Email: support@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourgpt/woocommerce-ai-action/issues)
- 📖 Documentation: [Project Wiki](https://github.com/yourgpt/woocommerce-ai-action/wiki)
- 💬 Discord: [Join our community](https://discord.gg/yourgpt)

## 🔗 Links
- Website: [Copilot Todo List](https://yourgpt.ai/chatbot)
- GitHub: [copilot-todo-list](https://github.com/yourgpt/woocommerce-ai-action)
- Documentation: [Project Documentation](https://docs.yourgpt.ai)

---

Made with ❤️ by YourGPT Team
