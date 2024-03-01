let productData = []; // Initialize an empty array to hold product data


// Function to fetch product data from product.json
async function loadProductData() {
    try {
        const response = await fetch('product.json'); 
        productData = await response.json(); 
    } catch (error) {
        console.error('Failed to load product data:', error);
    }
}



// Function to filter products by name or code
function filterProducts(query) {
    query = query.toLowerCase().trim();
    return productData.filter(product =>
        product.Name.toLowerCase().includes(query) || product.Code.toString().includes(query)
    );
}

// Function to display filtered products as dropdown options
function displayFilteredProducts(filteredProducts) {
    const searchResults = document.getElementById('searchResults');
    searchResults.innerHTML = ''; // Clear previous results
    filteredProducts.forEach(product => {
        const option = document.createElement('div');
        option.textContent = `${product.Name} (${product.Code})`;
        option.classList.add('search-result-item'); // Add class for styling
        option.addEventListener('click', () => {
            // Display selected product info
            showPopup(product); // Corrected function call
            // Clear search input and hide dropdown
            document.getElementById('searchInput').value = '';
            searchResults.innerHTML = '';
        });
        searchResults.appendChild(option);
    });
    searchResults.style.display = filteredProducts.length > 0 ? 'block' : 'none';
}

// Function to format price with commas for thousands separator
function formatPrice(price) {
    return price.toLocaleString('vi-VN'); // Using 'vi-VN' locale for Vietnamese format
}


// Function to fetch product info from product.json and display it in the product info box
function showPopup(product) {
    // Get references to elements in the product info box
    const productName = document.getElementById('productName');
    const productImage = document.getElementById('productImage');
    const productPrice = document.getElementById('productPrice');
    const productDescription = document.getElementById('productDescription');

    // Populate product info
    productName.textContent = product.Name;
    productImage.src = product.Image;
    productPrice.textContent = `Giá: ${formatPrice(product.Price)} đ`; // Format price here
    productDescription.textContent = `Miêu tả: ${product.Description}`;

    // Display the product info box
    const productInfoBox = document.getElementById('productInfoBox');
    productInfoBox.style.display = 'block';
}

// Function to close the product info box
function closeProductInfoBox() {
    const productInfoBox = document.getElementById('productInfoBox');
    productInfoBox.style.display = 'none';
}

// Function to initialize search functionality
function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', function() {
        const query = searchInput.value;
        const filteredProducts = filterProducts(query);
        displayFilteredProducts(filteredProducts);
    });

    document.addEventListener('click', function(event) {
        if (!event.target.closest('.search-container')) {
            document.getElementById('searchResults').style.display = 'none';
        }
    });
}

// Event listener when the DOM content is loaded
// Event listener when the DOM content is loaded
document.addEventListener('DOMContentLoaded', function() {
    loadProductData().then(() => {
        // Once data is loaded, execute other functions
        initializeSearch();
        initializeScanner();
    }).catch(error => {
        console.error('Error loading product data:', error);
    });
});



// Event listener for the start scan button
function initializeScanner() {
    const startScanBtn = document.getElementById('startScanBtn');
    startScanBtn.addEventListener('click', startScanner);
}
function preprocessBarcode(barcode) {
    // Remove all spaces from the barcode
    const processedBarcode = barcode.replace(/\s/g, '');
    
    // If the processed barcode is longer than 13 digits, take the first 13 digits
    return processedBarcode.substring(0, 13);
}
// Function to start the barcode scanner
function startScanner() {
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#scanner-container')
        },
        decoder: {
            readers: ["ean_reader"]
        }
    }, function(err) {
        if (err) {
            console.error('Failed to initialize Quagga:', err);
            return;
        }
        Quagga.start();
    });
    // Remove spaces and ensure the barcode is 13 digits long
    Quagga.onDetected(function(data) {
        Quagga.stop();
        const barcode = data.codeResult.code;
        const productInfo = getProductInfo(barcode);
        if (productInfo) {
            showPopup(productInfo);
        } else {
            alert("Không tìm thấy sản phẩm!");
        }
    });
}


// Function to handle the scanned barcode
function handleScannedBarcode(barcode) {
    // Preprocess the scanned barcode to remove spaces and ensure it's 13 digits long
    const processedBarcode = preprocessBarcode(barcode);

    // Check if the processed barcode is 13 digits long
    if (processedBarcode.length === 13) {
        // Handle the processed barcode
        const productInfo = getProductInfo(processedBarcode);
        if (productInfo) {
            showPopup(productInfo);
        } else {
            alert("Không tìm thấy sản phẩm!");
        }
    } else {
        alert("Barcode không hợp lệ!"); // Notify the user if the barcode is invalid
    }
}

// Function to retrieve product information based on the barcode// Function to retrieve product information based on the barcode
function getProductInfo(barcode) {
    // Search for product information by barcode in the loaded JSON data
    const product = productData.find(product => product.Code.toString() === barcode);
    if (product) {
        // Format the prices with dots for thousands separators and commas for decimal points
        const formattedPrice = product.Price.toLocaleString('en-US', { style: 'currency', currency: 'VND' }).replace(/\./g, ',');
        return {
            id: product.Code, // Add product ID to identify items uniquely
            title: product.Name,
            Price: formattedPrice,
        };
    }
    return null;
}
