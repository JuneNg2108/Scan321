// BanLe.js


document.addEventListener('DOMContentLoaded', function () {
    const startScanBtn = document.getElementById('startScanBtn');
    startScanBtn.addEventListener('click', startScanner);
});

function startScanner() {
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: document.querySelector('#scanner-container')
        },
        decoder: {
            readers: ["ean_reader"] // Specify the barcode format to be EAN-13
        }
    }, function (err) {
        if (err) {
            console.error('Failed to initialize Quagga:', err);
            return;
        }
        Quagga.start();
    });

    Quagga.onDetected(function (data) {
        Quagga.stop();
        const barcode = data.codeResult.code;
        // Handle the scanned barcode (e.g., search for product info)
        handleScannedBarcode(barcode);
    });
}


function handleScannedBarcode(barcode) {
    const productInfo = getProductInfo(barcode);
    if (productInfo) {
        showPopup(productInfo);
    } else {
        alert("Không tìm thấy sản phẩm!");
    }
}


let productData = []; // Initialize an empty array to hold product data

// Function to fetch product data from product.json
async function loadProductData() {
    try {
        const response = await fetch('product.json'); // Fetch data from product.json
        productData = await response.json(); // Parse JSON response
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
            displayProductInfo(product);
            // Clear search input and hide dropdown
            document.getElementById('searchInput').value = '';
            searchResults.innerHTML = '';
        });
        searchResults.appendChild(option);
    });
    searchResults.style.display = filteredProducts.length > 0 ? 'block' : 'none';
}

// Event listener for search input
const searchInput = document.getElementById('searchInput');
searchInput.addEventListener('input', function() {
    const query = searchInput.value;
    const filteredProducts = filterProducts(query);
    displayFilteredProducts(filteredProducts);
});

// Function to hide search results when clicked outside
document.addEventListener('click', function(event) {
    if (!event.target.closest('.search-container')) {
        document.getElementById('searchResults').style.display = 'none';
    }
});

document.addEventListener('DOMContentLoaded', function() {
    try {
        loadProductData();
    } catch (error) {
        console.error('Error loading product data:', error);
    }
});