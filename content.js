// Function to extract price from element or its children
function extractPrice(element) {
    let price = extractPriceFromText(element.innerText || element.textContent);
    if (price) return price;

    for (let child of element.children) {
        price = extractPriceFromText(child.innerText || child.textContent);
        if (price) return price;
    }

    if (element.parentElement) {
        price = extractPriceFromText(element.parentElement.innerText || element.parentElement.textContent);
        if (price) return price;
    }
    return '';
}

// Helper function to identify price text
function extractPriceFromText(text) {
    const pricePatterns = [
        /(\$|£|€|¥)\s*\d+([.,]\d{2})?/,  
        /\d+([.,]\d{2})?\s*(\$|£|€|¥)/,  
        /\d+([.,]\d{2})?\s*(USD|EUR|GBP|JPY)/i  
    ];
    for (let pattern of pricePatterns) {
        const match = text.match(pattern);
        if (match) return match[0].replace(/[^\d.,]/g, '').replace(',', '.');
    }
    return '';
}

// Identifies elements likely to contain price data
function isPriceElement(element) {
    const priceKeywords = ['price', 'cost', 'total'];
    let currentElement = element;
    while (currentElement) {
        if (priceKeywords.some(keyword => 
            currentElement.getAttribute('itemprop') === keyword ||
            currentElement.getAttribute('data-' + keyword) !== null
        )) return true;
        currentElement = currentElement.parentElement;
    }
    return priceKeywords.some(keyword => 
        (element.innerText || '').toLowerCase().includes(keyword) || 
        (element.className || '').toLowerCase().includes(keyword) ||
        (element.id || '').toLowerCase().includes(keyword)
    );
}

// Initializes price detection and assigns event listeners to elements
function initializePriceDetection() {
    const allElements = document.body.getElementsByTagName('*');
    for (let element of allElements) {
        if (isPriceElement(element) && extractPrice(element)) {
            element.addEventListener('mouseover', handleMouseOver);
            element.addEventListener('mouseout', handleMouseOut);
        }
    }
}

// Handles mouseover events to display tooltip
function handleMouseOver(event) {
    const target = event.target;
    const price = extractPrice(target);
    if (price) {
        const numericPrice = parseFloat(price.replace(/[^0-9.]/g, ''));
        highlightPrice(target, numericPrice);
        showTooltip(target, numericPrice);
    }
}

// Chat interface and tooltip functions remain unchanged
// ...

// Observer for dynamic content updates
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    initializePriceDetection();
                }
            });
        }
    });
});
observer.observe(document.body, { childList: true, subtree: true });

// Initial call on page load
window.addEventListener('load', initializePriceDetection);
