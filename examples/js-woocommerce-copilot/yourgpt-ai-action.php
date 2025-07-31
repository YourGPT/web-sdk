<?php
/*
Plugin Name: YourGPT AI Action for WooCommerce
Plugin URI:        https://yourgpt.ai/chatbot
Description: Adds YourGPT AI-powered chatbot integration with WooCommerce, enabling automated storefront actions such as product search, cart management, order handling, and more via AI commands.
Version: 1.0.0
Author: YourGPT Team
*/

if (!defined('ABSPATH')) exit; // Prevent direct access

function yourgpt_add_inline_script() {
    if (!class_exists('WooCommerce')) return;
    ?>
   <script id="yourgpt-chatbot-integration">
        /**
         * --------------------------------------------------------------------------
         * YourGPT Chatbot Widget Initialization
         * --------------------------------------------------------------------------
         */
        window.YGC_WIDGET_ID = "YGC_WIDGET_ID";
        (function() {
            var script = document.createElement("script");
            script.src = "https://widget.yourgpt.ai/script.js";
            script.id = "yourgpt-chatbot";
            document.body.appendChild(script);
            // The main logic will run after the chatbot script is loaded.
            script.onload = initializeChatbotActions;
        })();

        // Wait for the DOM to be fully loaded before running any scripts.
        document.addEventListener("DOMContentLoaded", function() {
            // This function is now called via script.onload.
            // You can add other non-chatbot related DOM manipulations here.
        });


        /**
         * --------------------------------------------------------------------------
         * Main Chatbot Logic
         * Initializes all event listeners and helper functions.
         * --------------------------------------------------------------------------
         */
        function initializeChatbotActions() {
            // Wait until the chatbot object is available.
            if (!window.$yourgptChatbot) {
                // If the chatbot isn't ready yet, wait and try again.
                setTimeout(initializeChatbotActions, 200);
                return;
            }

            /**
             * --------------------------------------------------------------------------
             * Configuration & Constants
             * --------------------------------------------------------------------------
             */
            const WOOCOMMERCE_URLS = {
                site: '<?php echo esc_url(home_url('/')); ?>',
                shop: '<?php echo esc_url(get_permalink(wc_get_page_id('shop'))); ?>',
                cart: '<?php echo esc_url(wc_get_cart_url()); ?>',
                my_account: '<?php echo esc_url(get_permalink(get_option('woocommerce_myaccount_page_id'))); ?>',
                orders: '<?php echo esc_url(wc_get_endpoint_url('orders', '', get_permalink(get_option('woocommerce_myaccount_page_id')))); ?>'
            };

            const isOnProductPage = window.location.href.includes('/product/');

            /**
             * --------------------------------------------------------------------------
             * Helper Functions
             * --------------------------------------------------------------------------
             */

            // Finds the most similar string from a list based on a query.
            function findMostSimilar(query, items) {
                if (!query || !items || items.length === 0) return null;
                const queryNormalized = query.toLowerCase().replace(/-/g, ' ');
                let bestMatch = null;
                let bestScore = -1;

                for (const item of items) {
                    if (!item) continue;
                    const itemName = item.split('?')[0].replace(/-/g, ' ').replace(/\/$/, '').toLowerCase();
                    let score = 0;

                    if (itemName === queryNormalized) {
                        score = 100;
                    } else if (itemName.includes(queryNormalized)) {
                        score = 50;
                    } else {
                        const queryWords = queryNormalized.split(' ').filter(w => !['open', 'show', 'view', 'find'].includes(w));
                        queryWords.forEach(word => {
                            if (itemName.includes(word)) score += 10;
                        });
                    }
                    if (score > bestScore) {
                        bestScore = score;
                        bestMatch = item;
                    }
                }
                return bestMatch;
            }

            // Selects a product variant from a dropdown by its text.
            async function selectVariantOption(variantText) {
                const selectElement = document.querySelector('table.variations select');
                if (!selectElement) return { success: false, message: 'Variant dropdown not found.' };

                const matchedOption = Array.from(selectElement.options).find(opt =>
                    opt.text.toLowerCase().includes(variantText.toLowerCase())
                );

                if (matchedOption && matchedOption.value) {
                    selectElement.value = matchedOption.value;
                    selectElement.dispatchEvent(new Event('change', { bubbles: true }));
                    // Wait a moment for WooCommerce to update the UI (e.g., price, stock status).
                    await new Promise(resolve => setTimeout(resolve, 300));
                    return { success: true };
                }
                return { success: false, message: 'Variant not found.' };
            }

            // Gets all available product variant names from the dropdown.
            function getProductVariants() {
                const selectElement = document.querySelector('table.variations select');
                if (!selectElement) return [];
                return Array.from(selectElement.options)
                    .filter(opt => opt.value !== '') // Exclude the placeholder
                    .map(opt => opt.text.trim());
            }

            // Clicks the "Add to Cart" button for a product on a listing page.
            async function clickAddToCartOnListing(productName) {
                const productLinks = Array.from(document.querySelectorAll('.products li .woocommerce-loop-product__link'));
                const targetLink = productLinks.find(link => link.textContent.trim().toLowerCase() === productName.toLowerCase());
                const productContainer = targetLink ? targetLink.closest('li') : null;

                if (!productContainer) return { success: false, reason: 'product_not_found' };

                const addToCartButton = productContainer.querySelector('.add_to_cart_button');
                if (!addToCartButton) return { success: false, reason: 'button_not_found' };

                // If it's a variable product, we must redirect to the product page.
                if (addToCartButton.classList.contains('product_type_variable')) {
                    window.location.href = targetLink.href;
                    return { success: true, redirecting: true };
                }

                // For simple products, click the button.
                addToCartButton.click();
                return { success: true, redirecting: false };
            }
            
            /**
             * --------------------------------------------------------------------------
             * Chatbot Action Handlers
             * --------------------------------------------------------------------------
             */

            $yourgptChatbot.on("ai:action:show_all_products", (data, action) => {
                action.respond("Redirecting to the shop page...");
                window.location.href = WOOCOMMERCE_URLS.shop;
            });

            $yourgptChatbot.on("ai:action:view_cart", (data, action) => {
                action.respond("Opening the cart...");
                window.location.href = WOOCOMMERCE_URLS.cart;
            });

            $yourgptChatbot.on("ai:action:get_all_orders", (data, action) => {
                action.respond("Redirecting to your orders page...");
                window.location.href = WOOCOMMERCE_URLS.orders;
            });

            $yourgptChatbot.on("ai:action:checkout_cart", (data, action) => {
                action.respond("Proceeding to checkout...");
                // Note: The selector for the checkout button might vary by theme.
                // This targets the button on the cart page.
                const checkoutButton = document.querySelector('.checkout-button, a.checkout-button');
                if (checkoutButton) {
                    checkoutButton.click();
                } else {
                    action.respond("Could not find the checkout button. Please proceed manually.");
                }
            });

            $yourgptChatbot.on("ai:action:find_food_item", async (data, action) => {
                try {
                    const args = JSON.parse(data.action.tool.function.arguments);
                    const searchQuery = args.s || args.query;
                    action.respond(`Searching for "${searchQuery}"...`);
                    window.location.href = `${WOOCOMMERCE_URLS.site}?s=${encodeURIComponent(searchQuery)}&post_type=product`;
                } catch (error) {
                    action.respond("Sorry, I couldn't process that search request.");
                }
            });

            $yourgptChatbot.on("ai:action:filter_items", async (data, action) => {
                try {
                    const { min, max } = JSON.parse(data.action.tool.function.arguments);
                    action.respond(`Filtering products between ${min} and ${max}.`);
                    const filterUrl = new URL(WOOCOMMERCE_URLS.shop);
                    if (min) filterUrl.searchParams.set('min_price', min);
                    if (max) filterUrl.searchParams.set('max_price', max);
                    window.location.href = filterUrl.href;
                } catch (error) {
                    action.respond("Sorry, I couldn't apply those filters.");
                }
            });

            $yourgptChatbot.on("ai:action:view_product", (data, action) => {
                if (isOnProductPage) {
                    return action.respond("You are already on a product page.");
                }

                try {
                    const args = JSON.parse(data.action.tool.function.arguments);
                    const productQuery = args.s || args.productName;
                    
                    const productLinks = document.querySelectorAll('a[href*="/product/"]');
                    const allSlugs = Array.from(productLinks).map(link => link.href.split('/product/')[1]);
                    
                    const bestMatchSlug = findMostSimilar(productQuery, allSlugs);
                    
                    if (bestMatchSlug) {
                        action.respond(`Redirecting to the page for ${productQuery}.`);
                        window.location.href = `${WOOCOMMERCE_URLS.site}product/${bestMatchSlug}`;
                    } else {
                        action.respond(`I couldn't find a product matching "${productQuery}" on this page.`);
                    }
                } catch (error) {
                    action.respond("Sorry, I was unable to find that product.");
                }
            });

            $yourgptChatbot.on("ai:action:add_to_cart", async (data, action) => {
                try {
                    const { productName, qty = 1, variant } = JSON.parse(data.action.tool.function.arguments);

                    if (isOnProductPage) {
                        // Logic for adding to cart from a single product page
                        if (variant) {
                            const variantResult = await selectVariantOption(variant);
                            if (!variantResult.success) {
                                const availableVariants = getProductVariants();
                                const response = availableVariants.length > 0 ?
                                    `Please choose from these variants: ${availableVariants.join(', ')}` :
                                    "This product has no selectable variants.";
                                return action.respond(response);
                            }
                        }

                        const quantityInput = document.querySelector('.quantity .qty');
                        if (quantityInput) {
                            quantityInput.value = qty;
                            quantityInput.dispatchEvent(new Event('change', { bubbles: true }));
                        }

                        const addToCartBtn = document.querySelector(".single_add_to_cart_button");
                        if (addToCartBtn && !addToCartBtn.disabled && !addToCartBtn.classList.contains('wc-variation-is-unavailable')) {
                            addToCartBtn.click();
                            action.respond("Product added to your cart!");
                        } else {
                            action.respond("This product or variant is out of stock or requires an option to be selected.");
                        }

                    } else {
                        // Logic for adding to cart from a listing/shop page
                        const result = await clickAddToCartOnListing(productName);
                        if (result.success && !result.redirecting) {
                            action.respond("Product added to your cart!");
                        } else if (result.success && result.redirecting) {
                            action.respond("This product has options. Taking you to the product page to choose them.");
                        } else {
                           action.respond(`Could not find "${productName}". Please try another search or check the spelling.`);
                        }
                    }
                } catch (error) {
                    action.respond("An error occurred while trying to add the item to the cart.");
                }
            });

            $yourgptChatbot.on("ai:action:repeat_order", async (data, action) => {
                try {
                    action.respond("Checking your last order...");
                    const ordersResponse = await fetch(WOOCOMMERCE_URLS.orders);
                    const ordersHtml = await ordersResponse.text();
                    const parser = new DOMParser();
                    const ordersDoc = parser.parseFromString(ordersHtml, 'text/html');
                    
                    const latestOrderLink = ordersDoc.querySelector('a.woocommerce-button.view');
                    if (!latestOrderLink) {
                        return action.respond("You don't have any previous orders.");
                    }

                    const orderDetailResponse = await fetch(latestOrderLink.href);
                    const orderDetailHtml = await orderDetailResponse.text();
                    const orderDoc = parser.parseFromString(orderDetailHtml, 'text/html');
                    
                    const productRow = orderDoc.querySelector('tr.woocommerce-table__line-item.order_item');
                    if (!productRow) {
                        return action.respond("Could not find any products in your last order.");
                    }
                    
                    const productUrl = productRow.querySelector('td.woocommerce-table__product-name a')?.href;
                    const quantityText = productRow.querySelector('.product-quantity')?.innerText.replace(/[^\d]/g, '') || '1';
                    
                    if (!productUrl) {
                        return action.respond("Could not determine the product from your last order.");
                    }

                    // To add the product with the correct variant and quantity, we must visit the product page.
                    // We pass the details via URL parameters.
                    const repeatUrl = new URL(productUrl);
                    repeatUrl.searchParams.set('repeat_order', 'true');
                    repeatUrl.searchParams.set('quantity', quantityText);

                    action.respond("Found your last order item. Adding it to your cart now...");
                    window.location.href = repeatUrl.href;

                } catch (error) {
                    action.respond("Sorry, I couldn't repeat your last order due to an error.");
                }
            });
            
            // This function runs on page load to handle the redirect from the 'repeat_order' action.
            function handleRepeatOrderOnLoad() {
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get('repeat_order') === 'true' && isOnProductPage) {
                    const quantity = urlParams.get('quantity') || 1;

                    // Trigger the 'add to cart' action via the chatbot's event system
                    // This reuses the existing logic for adding a product on a product page.
                    $yourgptChatbot.execute("ai:action:add_to_cart", {
                        action: {
                            tool: {
                                function: {
                                    // We stringify because the handler expects a JSON string
                                    arguments: JSON.stringify({
                                        productName: document.title, // or extract from DOM
                                        qty: quantity
                                        // Variant handling is managed by the add_to_cart logic
                                    })
                                }
                            }
                        }
                    });

                    // Clean the URL to avoid re-adding on refresh
                    const cleanUrl = window.location.href.split('?')[0];
                    window.history.replaceState({}, document.title, cleanUrl);
                }
            }

            // Execute the handler on page load.
            handleRepeatOrderOnLoad();
        }
    </script>
    <?php
}
add_action('wp_footer', 'yourgpt_add_inline_script');
