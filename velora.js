/* ==========================================================================
   VELORA ATELIER — CORE INTERACTION ENGINE
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    
    // --- DOM Elements ---
    const menuBtn = document.getElementById("menuBtn");
    const navLinks = document.getElementById("navLinks");
    const categoryButtons = document.querySelectorAll(".category");
    const productCards = document.querySelectorAll(".product-card");
    
    const cartBtn = document.getElementById("cartBtn");
    const cartPanel = document.getElementById("cartPanel");
    const closeCart = document.getElementById("closeCart");
    const overlay = document.getElementById("overlay");
    const cartItems = document.getElementById("cartItems");
    const cartCount = document.getElementById("cartCount");
    const cartTotal = document.getElementById("cartTotal");
    const checkoutBtn = document.querySelector(".checkout-btn");
    
    const newsletterForm = document.getElementById("newsletterForm");
    const searchBtn = document.querySelector(".icon-btn");
    
    // Application State
    let cart = [];

    /* ==========================================
       1. NAVIGATION & MOBILE MENU
       ========================================== */
    const toggleMenu = () => {
        navLinks.classList.toggle("active");
        if (menuBtn) menuBtn.classList.toggle("open");
    };

    if (menuBtn) {
        menuBtn.addEventListener("click", toggleMenu);
    }

    // Close menu when link clicked
    document.querySelectorAll(".nav-links a").forEach(link => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("active");
        });
    });

    /* ==========================================
       2. PRODUCT FILTERING SYSTEM
       ========================================== */
    categoryButtons.forEach(button => {
        button.addEventListener("click", () => {
            categoryButtons.forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");

            const selectedCategory = button.dataset.category;

            productCards.forEach(product => {
                const productCategory = product.dataset.category;

                if (selectedCategory === "all" || productCategory === selectedCategory) {
                    product.style.display = "flex";
                    product.style.opacity = "0";
                    setTimeout(() => {
                        product.style.transition = "opacity 0.4s ease";
                        product.style.opacity = "1";
                    }, 50);
                } else {
                    product.style.display = "none";
                }
            });
        });
    });

    /* ==========================================
       3. SHOPPING CART DRAWER
       ========================================== */
    const openCart = () => {
        cartPanel.classList.add("active");
        overlay.classList.add("active");
        document.body.style.overflow = "hidden";
    };

    const closeCartPanel = () => {
        cartPanel.classList.remove("active");
        overlay.classList.remove("active");
        document.body.style.overflow = "";
    };

    if (cartBtn) cartBtn.addEventListener("click", openCart);
    if (closeCart) closeCart.addEventListener("click", closeCartPanel);
    if (overlay) overlay.addEventListener("click", closeCartPanel);

    /* ==========================================
       4. ADD TO CART & DYNAMIC PRICE CALCULATION
       ========================================== */
    document.querySelectorAll(".add-cart").forEach(button => {
        button.addEventListener("click", (e) => {
            const productCard = e.target.closest(".product-card");
            const productName = e.target.dataset.product || productCard.querySelector("h3").textContent;
            
            // Extract numerical price directly from DOM
            const priceText = productCard.querySelector(".price").textContent;
            const price = parseFloat(priceText.replace(/[^0-9.-]+/g, ""));
            const imageSrc = productCard.querySelector("img")?.src || "";

            addToCart(productName, price, imageSrc);
            showNotification(`${productName} added to bag.`);
            openCart();
        });
    });

    const addToCart = (name, price, image) => {
        const existingItem = cart.find(item => item.name === name);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({ name, price, image, quantity: 1 });
        }

        updateCartUI();
    };

    const updateCartUI = () => {
        // Update Total Items Count Badge
        const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalCount;

        cartItems.innerHTML = "";

        if (cart.length === 0) {
            cartItems.innerHTML = `<p class="empty-cart">Your bag is currently empty.</p>`;
            cartTotal.textContent = "$0.00";
            return;
        }

        let totalPrice = 0;

        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            totalPrice += itemTotal;

            const itemElement = document.createElement("div");
            itemElement.className = "cart-item";
            itemElement.style.cssText = "display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--line);";

            itemElement.innerHTML = `
                <div style="display: flex; align-items: center; gap: 12px;">
                    ${item.image ? `<img src="${item.image}" alt="${item.name}" style="width: 50px; height: 60px; object-fit: cover;">` : ''}
                    <div>
                        <h4 style="font-family: var(--font-heading); font-size: 0.9rem;">${item.name}</h4>
                        <p style="font-size: 0.75rem; color: var(--muted);">$${item.price.toFixed(2)} x ${item.quantity}</p>
                    </div>
                </div>
                <button class="remove-item" data-index="${index}" aria-label="Remove item" style="color: var(--accent-dark); font-size: 0.75rem; font-weight: 600;">
                    Remove
                </button>
            `;

            cartItems.appendChild(itemElement);
        });

        cartTotal.textContent = `$${totalPrice.toFixed(2)}`;

        // Attach event listeners to new Remove buttons
        document.querySelectorAll(".remove-item").forEach(button => {
            button.addEventListener("click", (e) => {
                const index = Number(e.target.dataset.index);
                cart.splice(index, 1);
                updateCartUI();
            });
        });
    };

    /* ==========================================
       5. WISHLIST TOGGLE WITH ANIMATION
       ========================================== */
    document.querySelectorAll(".wishlist").forEach(button => {
        button.addEventListener("click", () => {
            const isLiked = button.classList.contains("liked");

            if (!isLiked) {
                button.classList.add("liked");
                button.textContent = "♥";
                button.style.color = "#a83232";
                showNotification("Saved to wishlist");
            } else {
                button.classList.remove("liked");
                button.textContent = "♡";
                button.style.color = "";
            }
        });
    });

    /* ==========================================
       6. NEWSLETTER & CHECKOUT HANDLING
       ========================================== */
    if (newsletterForm) {
        newsletterForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const emailInput = document.getElementById("newsletterEmail");

            if (emailInput && emailInput.value.trim() !== "") {
                showNotification("Thank you for subscribing to Velora.");
                newsletterForm.reset();
            }
        });
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", () => {
            if (cart.length === 0) {
                showNotification("Your bag is empty.");
                return;
            }
            showNotification("Redirecting to secure checkout...");
        });
    }

    /* ==========================================
       7. PRODUCT SEARCH FILTER
       ========================================== */
    if (searchBtn) {
        searchBtn.addEventListener("click", () => {
            const searchTerm = prompt("Search our catalog:");

            if (!searchTerm) return;

            const term = searchTerm.toLowerCase().trim();
            let found = false;

            productCards.forEach(product => {
                const productName = product.querySelector("h3").textContent.toLowerCase();

                if (productName.includes(term)) {
                    product.style.outline = "2px solid var(--accent)";
                    product.scrollIntoView({ behavior: "smooth", block: "center" });
                    found = true;

                    setTimeout(() => {
                        product.style.outline = "none";
                    }, 3500);
                }
            });

            if (!found) {
                showNotification("No matching products found.");
            }
        });
    }

    /* ==========================================
       8. UTILITY: CUSTOM TOAST NOTIFICATION
       ========================================== */
    function showNotification(message) {
        const existingToast = document.querySelector(".velora-toast");
        if (existingToast) existingToast.remove();

        const toast = document.createElement("div");
        toast.className = "velora-toast";
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%) translateY(20px);
            background: #121212;
            color: #ffffff;
            padding: 12px 24px;
            font-size: 0.8rem;
            letter-spacing: 1px;
            text-transform: uppercase;
            z-index: 3000;
            opacity: 0;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            pointer-events: none;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        `;

        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = "1";
            toast.style.transform = "translateX(-50%) translateY(0)";
        }, 50);

        setTimeout(() => {
            toast.style.opacity = "0";
            toast.style.transform = "translateX(-50%) translateY(20px)";
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
});