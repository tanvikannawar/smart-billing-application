const loggedInUser = sessionStorage.getItem("loggedInUser");

if (!loggedInUser) {
    window.location.href = "login.html";
}

const dataSection = document.getElementById("dataSection");
const messageBox = document.getElementById("messageBox");

/* =====================================================
   COMMON FUNCTIONS
===================================================== */

function showLoading() {
    messageBox.innerHTML = `
        <div class="alert alert-info">Loading data...</div>
    `;

    dataSection.innerHTML = "";
}

function showError(message) {
    messageBox.innerHTML = `
        <div class="alert alert-danger">${message}</div>
    `;
}

function showSuccess(message) {
    messageBox.innerHTML = `
        <div class="alert alert-success">${message}</div>
    `;
}

function clearMessage() {
    messageBox.innerHTML = "";
}

async function getErrorMessage(response, defaultMessage) {
    try {
        const contentType = response.headers.get("content-type");

        if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();

            if (errorData.message) {
                return errorData.message;
            }

            const values = Object.values(errorData);

            if (values.length > 0) {
                return values.join(", ");
            }
        } else {
            const text = await response.text();

            if (text) {
                return text;
            }
        }
    } catch (error) {
        console.error("Unable to read error response:", error);
    }

    return defaultMessage;
}

function formatMoney(value) {
    if (value === null || value === undefined || value === "") {
        return "Not available";
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
        return "Not available";
    }

    return `₹${number.toFixed(2)}`;
}

function formatInvoiceDate(value) {
    if (!value) {
        return "Not available";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "Not available";
    }

    return date.toLocaleString("en-IN", {
        day: "2-digit",
        month: "2-digit",
        year :"numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

/* =====================================================
   PRODUCT FUNCTIONS
===================================================== */
async function loadProducts()
 {
    showLoading();

    try {
        const response = await fetch("/api/products");

        if (!response.ok) {
            throw new Error("Unable to load products");
        }

        const products = await response.json();

        clearMessage();

        let rows = "";

        products.forEach(product => {
            rows += `
                <tr>
                    <td>${product.id}</td>
                    <td>${product.productName}</td>
                    <td>${formatMoney(product.price)}</td>
                    <td>${product.quantity}</td>

                    <td>
                        <button
                            class="btn btn-sm btn-warning me-1"
                            onclick="showEditProductForm(${product.id})">
                            Edit
                        </button>

                        <button
                            class="btn btn-sm btn-danger"
                            onclick="deleteProduct(${product.id})">
                            Delete
                        </button>
                    </td>
                </tr>
            `;
        });

        if (products.length === 0) {
            rows = `
                <tr>
                    <td colspan="5" class="text-center">
                        No products available
                    </td>
                </tr>
            `;
        }

        dataSection.innerHTML = `
            <div class="card shadow p-4">

                <div class="d-flex justify-content-between align-items-center mb-3">

                    <h2>Products</h2>

                    <button
                        class="btn btn-success"
                        onclick="showProductForm()">
                        Add Product
                    </button>

                </div>

                <div class="table-responsive">

                    <table class="table table-bordered table-striped">

                        <thead class="table-primary">

                            <tr>
                                <th>ID</th>
                                <th>Product Name</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Actions</th>
                            </tr>

                        </thead>

                        <tbody>
                            ${rows}
                        </tbody>

                    </table>

                </div>

            </div>
        `;

    } catch (error) {
        showError(error.message);
    }
}

function showProductForm() {
    clearMessage();

    dataSection.innerHTML = `
        <div class="card shadow p-4">

            <h2 class="mb-4">Add Product</h2>

            <div class="mb-3">

                <label
                    for="productName"
                    class="form-label">
                    Product Name
                </label>

                <input
                    type="text"
                    id="productName"
                    class="form-control"
                    placeholder="Enter product name">

            </div>

            <div class="mb-3">

                <label
                    for="price"
                    class="form-label">
                    Price
                </label>

                <input
                    type="number"
                    id="price"
                    class="form-control"
                    placeholder="Enter product price"
                    min="0.01"
                    step="0.01">

            </div>

            <div class="mb-3">

                <label
                    for="quantity"
                    class="form-label">
                    Quantity
                </label>

                <input
                    type="number"
                    id="quantity"
                    class="form-control"
                    placeholder="Enter product quantity"
                    min="0"
                    step="1">

            </div>

            <div class="d-flex gap-2">

                <button
                    class="btn btn-success"
                    onclick="addProduct()">
                    Save Product
                </button>

                <button
                    class="btn btn-secondary"
                    onclick="loadProducts()">
                    Cancel
                </button>

            </div>

        </div>
    `;
}

async function addProduct() {
    const productName =
        document.getElementById("productName").value.trim();

    const priceValue =
        document.getElementById("price").value;

    const quantityValue =
        document.getElementById("quantity").value;

    const price = Number(priceValue);
    const quantity = Number(quantityValue);

    if (productName === "") {
        showError("Product name is required");
        return;
    }

    if (priceValue === "" || price <= 0) {
        showError("Price must be greater than 0");
        return;
    }

    if (
        quantityValue === "" ||
        !Number.isInteger(quantity) ||
        quantity < 0
    ) {
        showError("Quantity must be a non-negative whole number");
        return;
    }

    const product = {
        productName: productName,
        price: priceValue,
        quantity: quantity
    };

    try {
        const response = await fetch("/api/products", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(product)
        });

        if (!response.ok) {
            throw new Error(
                await getErrorMessage(
                    response,
                    "Unable to add product"
                )
            );
        }

        showSuccess("Product added successfully");

        setTimeout(() => {
            loadProducts();
        }, 700);

    } catch (error) {
        showError(error.message);
    }
}

async function showEditProductForm(productId) {
    showLoading();

    try {
        const response =
            await fetch(`/api/products/${productId}`);

        if (!response.ok) {
            throw new Error("Unable to load product details");
        }

        const product = await response.json();

        clearMessage();

        dataSection.innerHTML = `
            <div class="card shadow p-4">

                <h2 class="mb-4">Edit Product</h2>

                <div class="mb-3">

                    <label
                        for="editProductName"
                        class="form-label">
                        Product Name
                    </label>

                    <input
                        type="text"
                        id="editProductName"
                        class="form-control"
                        value="${product.productName}">

                </div>

                <div class="mb-3">

                    <label
                        for="editProductPrice"
                        class="form-label">
                        Price
                    </label>

                    <input
                        type="number"
                        id="editProductPrice"
                        class="form-control"
                        value="${product.price}"
                        min="0.01"
                        step="0.01">

                </div>

                <div class="mb-3">

                    <label
                        for="editProductQuantity"
                        class="form-label">
                        Quantity
                    </label>

                    <input
                        type="number"
                        id="editProductQuantity"
                        class="form-control"
                        value="${product.quantity}"
                        min="0"
                        step="1">

                </div>

                <div class="d-flex gap-2">

                    <button
                        class="btn btn-warning"
                        onclick="updateProduct(${product.id})">
                        Update Product
                    </button>

                    <button
                        class="btn btn-secondary"
                        onclick="loadProducts()">
                        Cancel
                    </button>

                </div>

            </div>
        `;

    } catch (error) {
        showError(error.message);
    }
}

async function updateProduct(productId) {
    const productName =
        document.getElementById("editProductName").value.trim();

    const priceValue =
        document.getElementById("editProductPrice").value;

    const quantityValue =
        document.getElementById("editProductQuantity").value;

    const price = Number(priceValue);
    const quantity = Number(quantityValue);

    if (productName === "") {
        showError("Product name is required");
        return;
    }

    if (priceValue === "" || price <= 0) {
        showError("Price must be greater than 0");
        return;
    }

    if (
        quantityValue === "" ||
        !Number.isInteger(quantity) ||
        quantity < 0
    ) {
        showError("Quantity must be a non-negative whole number");
        return;
    }

    const product = {
        productName: productName,
        price: priceValue,
        quantity: quantity
    };

    try {
        const response =
            await fetch(`/api/products/${productId}`, {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(product)
            });

        if (!response.ok) {
            throw new Error(
                await getErrorMessage(
                    response,
                    "Unable to update product"
                )
            );
        }

        showSuccess("Product updated successfully");

        setTimeout(() => {
            loadProducts();
        }, 700);

    } catch (error) {
        showError(error.message);
    }
}

async function deleteProduct(productId) {
    const confirmed = confirm(
        "Are you sure you want to delete this product?"
    );

    if (!confirmed) {
        return;
    }

    try {
        const response =
            await fetch(`/api/products/${productId}`, {
                method: "DELETE"
            });

        if (!response.ok) {
            throw new Error(
                await getErrorMessage(
                    response,
                    "Unable to delete product"
                )
            );
        }

        showSuccess("Product deleted successfully");

        setTimeout(() => {
            loadProducts();
        }, 700);

    } catch (error) {
        showError(error.message);
    }
}

/* =====================================================
   CUSTOMER FUNCTIONS
===================================================== */

async function loadCustomers() {
    showLoading();

    try {
        const response = await fetch("/api/customers");

        if (!response.ok) {
            throw new Error("Unable to load customers");
        }

        const customers = await response.json();

        clearMessage();
        displayCustomers(customers);

    } catch (error) {
        showError(error.message);
    }
}

function displayCustomers(customers, searchKeyword = "") {

    let rows = "";

    customers.forEach(customer => {
        rows += `
            <tr>
                <td>${customer.id}</td>
                <td>${customer.customerName}</td>
                <td>${customer.email}</td>
                <td>${customer.phone}</td>

                <td>
                    <button
                        class="btn btn-sm btn-warning me-1"
                        onclick="showEditCustomerForm(${customer.id})">
                        Edit
                    </button>

                    <button
                        class="btn btn-sm btn-danger"
                        onclick="deleteCustomer(${customer.id})">
                        Delete
                    </button>
                </td>
            </tr>
        `;
    });

    if (customers.length === 0) {
        rows = `
            <tr>
                <td colspan="5" class="text-center">
                    No customers found
                </td>
            </tr>
        `;
    }

    dataSection.innerHTML = `
        <div class="card shadow p-4">

            <div class="d-flex justify-content-between align-items-center mb-3">

                <h2>Customers</h2>

                <button
                    class="btn btn-primary"
                    onclick="showCustomerForm()">
                    Add Customer
                </button>

            </div>

            <div class="mb-3">
                <input
                    type="text"
                    id="customerTableSearch"
                    class="form-control"
                    placeholder="Search by name, email or phone..."
                    value="${searchKeyword}"
                    oninput="searchCustomers()">
            </div>

            <div class="table-responsive">

                <table class="table table-bordered table-striped">

                    <thead class="table-success">
                        <tr>
                            <th>ID</th>
                            <th>Customer Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        ${rows}
                    </tbody>

                </table>

            </div>

        </div>
    `;
}

let customerSearchTimer;

function searchCustomers() {

    const searchInput =
        document.getElementById("customerTableSearch");

    if (!searchInput) {
        return;
    }

    const keyword = searchInput.value.trim();

    clearTimeout(customerSearchTimer);

    customerSearchTimer = setTimeout(async () => {

        try {

            const url = keyword === ""
                ? "/api/customers"
                : `/api/customers/search?keyword=${encodeURIComponent(keyword)}`;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error("Unable to search customers");
            }

            const customers = await response.json();

            displayCustomers(customers, keyword);

        } catch (error) {
            showError(error.message);
        }

    }, 250);
}
function showCustomerForm() {
    clearMessage();

    dataSection.innerHTML = `
        <div class="card shadow p-4">

            <h2 class="mb-4">Add Customer</h2>

            <div class="mb-3">

                <label
                    for="customerName"
                    class="form-label">
                    Customer Name
                </label>

                <input
                    type="text"
                    id="customerName"
                    class="form-control"
                    placeholder="Enter customer name">

            </div>

            <div class="mb-3">

                <label
                    for="customerEmail"
                    class="form-label">
                    Email
                </label>

                <input
                    type="email"
                    id="customerEmail"
                    class="form-control"
                    placeholder="Enter customer email">

            </div>

            <div class="mb-3">

                <label
                    for="customerPhone"
                    class="form-label">
                    Phone Number
                </label>

                <input
                    type="text"
                    id="customerPhone"
                    class="form-control"
                    maxlength="10"
                    placeholder="Enter 10-digit phone number">

            </div>

            <div class="d-flex gap-2">

                <button
                    class="btn btn-primary"
                    onclick="addCustomer()">
                    Save Customer
                </button>

                <button
                    class="btn btn-secondary"
                    onclick="loadCustomers()">
                    Cancel
                </button>

            </div>

        </div>
    `;
}

async function addCustomer() {
    const customerName =
        document.getElementById("customerName").value.trim();

    const email =
        document.getElementById("customerEmail").value.trim();

    const phone =
        document.getElementById("customerPhone").value.trim();

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (customerName === "") {
        showError("Customer name is required");
        return;
    }

    if (!emailPattern.test(email)) {
        showError("Please enter a valid email");
        return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
        showError("Phone number must be exactly 10 digits");
        return;
    }

    const customer = {
        customerName: customerName,
        email: email,
        phone: phone
    };

    try {
        const response = await fetch("/api/customers", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(customer)
        });

        if (!response.ok) {
            throw new Error(
                await getErrorMessage(
                    response,
                    "Unable to add customer"
                )
            );
        }

        showSuccess("Customer added successfully");

        setTimeout(() => {
            loadCustomers();
        }, 700);

    } catch (error) {
        showError(error.message);
    }
}

async function showEditCustomerForm(customerId) {
    showLoading();

    try {
        const response =
            await fetch(`/api/customers/${customerId}`);

        if (!response.ok) {
            throw new Error("Unable to load customer details");
        }

        const customer = await response.json();

        clearMessage();

        dataSection.innerHTML = `
            <div class="card shadow p-4">

                <h2 class="mb-4">Edit Customer</h2>

                <div class="mb-3">

                    <label
                        for="editCustomerName"
                        class="form-label">
                        Customer Name
                    </label>

                    <input
                        type="text"
                        id="editCustomerName"
                        class="form-control"
                        value="${customer.customerName}">

                </div>

                <div class="mb-3">

                    <label
                        for="editCustomerEmail"
                        class="form-label">
                        Email
                    </label>

                    <input
                        type="email"
                        id="editCustomerEmail"
                        class="form-control"
                        value="${customer.email}">

                </div>

                <div class="mb-3">

                    <label
                        for="editCustomerPhone"
                        class="form-label">
                        Phone Number
                    </label>

                    <input
                        type="text"
                        id="editCustomerPhone"
                        class="form-control"
                        maxlength="10"
                        value="${customer.phone}">

                </div>

                <div class="d-flex gap-2">

                    <button
                        class="btn btn-warning"
                        onclick="updateCustomer(${customer.id})">
                        Update Customer
                    </button>

                    <button
                        class="btn btn-secondary"
                        onclick="loadCustomers()">
                        Cancel
                    </button>

                </div>

            </div>
        `;

    } catch (error) {
        showError(error.message);
    }
}

async function updateCustomer(customerId) {
    const customerName =
        document.getElementById("editCustomerName").value.trim();

    const email =
        document.getElementById("editCustomerEmail").value.trim();

    const phone =
        document.getElementById("editCustomerPhone").value.trim();

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (customerName === "") {
        showError("Customer name is required");
        return;
    }

    if (!emailPattern.test(email)) {
        showError("Please enter a valid email");
        return;
    }

    if (!/^[0-9]{10}$/.test(phone)) {
        showError("Phone number must be exactly 10 digits");
        return;
    }

    const customer = {
        customerName: customerName,
        email: email,
        phone: phone
    };

    try {
        const response =
            await fetch(`/api/customers/${customerId}`, {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(customer)
            });

        if (!response.ok) {
            throw new Error(
                await getErrorMessage(
                    response,
                    "Unable to update customer"
                )
            );
        }

        showSuccess("Customer updated successfully");

        setTimeout(() => {
            loadCustomers();
        }, 700);

    } catch (error) {
        showError(error.message);
    }
}

async function deleteCustomer(customerId) {
    const confirmed = confirm(
        "Are you sure you want to delete this customer?"
    );

    if (!confirmed) {
        return;
    }

    try {
        const response =
            await fetch(`/api/customers/${customerId}`, {
                method: "DELETE"
            });

        if (!response.ok) {
            throw new Error(
                await getErrorMessage(
                    response,
                    "Unable to delete customer"
                )
            );
        }

        showSuccess("Customer deleted successfully");

        setTimeout(() => {
            loadCustomers();
        }, 700);

    } catch (error) {
        showError(error.message);
    }
}

/* =====================================================
   INVOICE FUNCTIONS
===================================================== */
let invoiceItems = [];
async function loadInvoices(searchName = "") {
    showLoading();

    try {
        let url = "/api/invoices";

        if (searchName.trim() !== "") {
            url =
                "/api/invoices/search?customerName=" +
                encodeURIComponent(searchName.trim());
        }

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Unable to load invoices");
        }

        const invoices = await response.json();

        clearMessage();

        let rows = "";

        invoices.forEach(invoice => {

            let itemDetails = "No items";

            if (invoice.items && invoice.items.length > 0) {
                itemDetails = invoice.items
                    .map(item => `
                        <div>
                            ${item.productName}
                            × ${item.quantity}
                            = ${formatMoney(item.subTotal)}
                        </div>
                    `)
                    .join("");
            }

            rows += `
                <tr>
                    <td>${invoice.id}</td>

                    <td>
                        ${formatInvoiceDate(invoice.invoiceDate)}
                    </td>

                    <td>
                        ${invoice.customerName || "Not available"}
                    </td>

                    <td>
                        ${invoice.customerEmail || "Not available"}
                    </td>

                    <td>
                        ${invoice.customerPhone || "Not available"}
                    </td>

                    <td>
                        ${itemDetails}
                    </td>

                    <td>
                        ${formatMoney(invoice.totalAmount)}
                    </td>
<td>

    <button
        class="btn btn-sm btn-primary me-1"
        onclick="printInvoice(${invoice.id})">
        Print
    </button>

    <button
        class="btn btn-sm btn-success me-1"
        onclick="downloadInvoicePDF(${invoice.id})">
        PDF
    </button>

    <button
        class="btn btn-sm btn-danger"
        onclick="deleteInvoice(${invoice.id})">
        Delete
    </button>
</td>
                        
            `;
        });

        if (invoices.length === 0) {
            rows = `
                <tr>
                    <td colspan="8" class="text-center">
                        No invoices found
                    </td>
                </tr>
            `;
        }

        dataSection.innerHTML = `
            <div class="card shadow p-4">

                <div class="d-flex justify-content-between align-items-center mb-3">

                    <h2>Invoices</h2>

                    <button
                        class="btn btn-dark"
                        onclick="showInvoiceForm()">
                        Create Invoice
                    </button>

                </div>

                <div class="row g-2 mb-3">

                    <div class="col-md-8">
                        <input
                            type="text"
                            id="invoiceSearchInput"
                            class="form-control"
                            placeholder="Search invoice by customer name"
                            value="${searchName}"
                        >
                    </div>

                    <div class="col-md-2 d-grid">
                        <button
                            class="btn btn-primary"
                            onclick="searchInvoices()">
                            Search
                        </button>
                    </div>

                    <div class="col-md-2 d-grid">
                        <button
                            class="btn btn-secondary"
                            onclick="clearInvoiceSearch()">
                            Clear
                        </button>
                    </div>

                </div>

                <div class="table-responsive">

                    <table class="table table-bordered table-striped">

                        <thead class="table-warning">

                            <tr>
                                <th>ID</th>
                                <th>Date</th>
                                <th>Customer Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Items</th>
                                <th>Total Amount</th>
                                <th>Action</th>
                            </tr>

                        </thead>

                        <tbody>
                            ${rows}
                        </tbody>

                    </table>

                </div>

            </div>
        `;

        const searchInput =
            document.getElementById("invoiceSearchInput");

        if (searchInput) {
            searchInput.addEventListener(
                "keydown",
                function (event) {
                    if (event.key === "Enter") {
                        searchInvoices();
                    }
                }
            );
        }

    } catch (error) {
        showError(error.message);
    }
}
function searchInvoices() {

    const searchInput =
        document.getElementById("invoiceSearchInput");

    if (!searchInput) {
        return;
    }

    loadInvoices(searchInput.value);
}

function clearInvoiceSearch() {
    loadInvoices();
}
async function showInvoiceForm() {
    showLoading();

    try {
        const customerResponse = await fetch("/api/customers");
        const productResponse = await fetch("/api/products");

        if (!customerResponse.ok) {
            throw new Error("Unable to load customers");
        }

        if (!productResponse.ok) {
            throw new Error("Unable to load products");
        }

        const customers = await customerResponse.json();
        const products = await productResponse.json();

        clearMessage();
        invoiceItems = [];

        if (customers.length === 0) {
            showError(
                "Please add at least one customer before creating an invoice"
            );
            return;
        }

        if (products.length === 0) {
            showError(
                "Please add at least one product before creating an invoice"
            );
            return;
        }

        let customerOptions = `
            <option value="">Select Customer</option>
        `;

        customers.forEach(customer => {
            customerOptions += `
                <option value="${customer.id}">
                    ${customer.customerName}
                </option>
            `;
        });

        let productOptions = `
            <option value="">Select Product</option>
        `;

        products.forEach(product => {
            productOptions += `
                <option
                    value="${product.id}"
                    data-name="${product.productName}"
                    data-price="${product.price}"
                    data-stock="${product.quantity}">
                    ${product.productName}
                    - ${formatMoney(product.price)}
                    - Stock: ${product.quantity}
                </option>
            `;
        });

        dataSection.innerHTML = `
            <div class="card shadow p-4">

                <h2 class="mb-4">Create Invoice</h2>

                <div class="mb-3">
                    <label
                        for="invoiceCustomer"
                        class="form-label">
                        Customer
                    </label>

                    <select
                        id="invoiceCustomer"
                        class="form-select">
                        ${customerOptions}
                    </select>
                </div>

                <div class="row g-3 align-items-end">

                    <div class="col-md-6">
                        <label
                            for="invoiceProduct"
                            class="form-label">
                            Product
                        </label>

                        <select
                            id="invoiceProduct"
                            class="form-select">
                            ${productOptions}
                        </select>
                    </div>

                    <div class="col-md-3">
                        <label
                            for="invoiceQuantity"
                            class="form-label">
                            Quantity
                        </label>

                        <input
                            type="number"
                            id="invoiceQuantity"
                            class="form-control"
                            min="1"
                            step="1"
                            placeholder="Enter quantity">
                    </div>

                    <div class="col-md-3">
                        <button
                            class="btn btn-success w-100"
                            onclick="addInvoiceItem()">
                            Add Item
                        </button>
                    </div>

                </div>

                <hr class="my-4">

                <h4>Bill Items</h4>

                <div class="table-responsive">
                    <table class="table table-bordered">

                        <thead class="table-light">
                            <tr>
                                <th>Product</th>
                                <th>Price</th>
                                <th>Quantity</th>
                                <th>Subtotal</th>
                                <th>Action</th>
                            </tr>
                        </thead>

                        <tbody id="invoiceItemsBody">
                            <tr>
                                <td
                                    colspan="5"
                                    class="text-center text-muted">
                                    No items added
                                </td>
                            </tr>
                        </tbody>

                    </table>
                </div>

                <div class="text-end mb-3">
                    <h4>
                        Grand Total:
                        <span id="invoiceGrandTotal">
                            ₹0.00
                        </span>
                    </h4>
                </div>

                <div class="d-flex gap-2">
                    <button
                        class="btn btn-dark"
                        onclick="createInvoice()">
                        Generate Invoice
                    </button>

                    <button
                        class="btn btn-secondary"
                        onclick="loadInvoices()">
                        Cancel
                    </button>
                </div>

            </div>
        `;

    } catch (error) {
        showError(error.message);
    }
}

function addInvoiceItem() {
    const productSelect =
        document.getElementById("invoiceProduct");

    const quantityValue =
        document.getElementById("invoiceQuantity").value;

    const productId = productSelect.value;
    const quantity = Number(quantityValue);

    if (productId === "") {
        showError("Please select a product");
        return;
    }

    if (
        quantityValue === "" ||
        !Number.isInteger(quantity) ||
        quantity <= 0
    ) {
        showError("Quantity must be a positive whole number");
        return;
    }

    const selectedOption =
        productSelect.options[productSelect.selectedIndex];

    const productName =
        selectedOption.dataset.name;

    const productPrice =
        Number(selectedOption.dataset.price);

    const availableStock =
        Number(selectedOption.dataset.stock);

    const existingItem =
        invoiceItems.find(
            item => item.productId === Number(productId)
        );

    const alreadyAddedQuantity =
        existingItem ? existingItem.quantity : 0;

    if (alreadyAddedQuantity + quantity > availableStock) {
        showError(
            `Insufficient stock. Available quantity: ${availableStock}`
        );
        return;
    }

    if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.subTotal =
            existingItem.productPrice * existingItem.quantity;
    } else {
        invoiceItems.push({
            productId: Number(productId),
            productName: productName,
            productPrice: productPrice,
            quantity: quantity,
            subTotal: productPrice * quantity
        });
    }

    clearMessage();

    document.getElementById("invoiceProduct").value = "";
    document.getElementById("invoiceQuantity").value = "";

    renderInvoiceItems();
}

function renderInvoiceItems() {
    const tableBody =
        document.getElementById("invoiceItemsBody");

    const grandTotalElement =
        document.getElementById("invoiceGrandTotal");

    if (!tableBody || !grandTotalElement) {
        return;
    }

    if (invoiceItems.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td
                    colspan="5"
                    class="text-center text-muted">
                    No items added
                </td>
            </tr>
        `;

        grandTotalElement.textContent = formatMoney(0);
        return;
    }

    let rows = "";
    let grandTotal = 0;

    invoiceItems.forEach((item, index) => {
        grandTotal += item.subTotal;

        rows += `
            <tr>
                <td>${item.productName}</td>
                <td>${formatMoney(item.productPrice)}</td>
                <td>${item.quantity}</td>
                <td>${formatMoney(item.subTotal)}</td>
                <td>
                    <button
                        class="btn btn-sm btn-danger"
                        onclick="removeInvoiceItem(${index})">
                        Remove
                    </button>
                </td>
            </tr>
        `;
    });

    tableBody.innerHTML = rows;
    grandTotalElement.textContent = formatMoney(grandTotal);
}

function removeInvoiceItem(index) {
    invoiceItems.splice(index, 1);
    renderInvoiceItems();
}

async function createInvoice() {
    const customerId =
        document.getElementById("invoiceCustomer").value;

    if (customerId === "") {
        showError("Please select a customer");
        return;
    }

    if (invoiceItems.length === 0) {
        showError("Please add at least one item");
        return;
    }

    const invoiceData = {
        customerId: Number(customerId),
        items: invoiceItems.map(item => ({
            productId: item.productId,
            quantity: item.quantity
        }))
    };

    try {
        const response = await fetch("/api/invoices", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(invoiceData)
        });

        if (!response.ok) {
            throw new Error(
                await getErrorMessage(
                    response,
                    "Unable to create invoice"
                )
            );
        }

        showSuccess("Invoice created successfully");
        invoiceItems = [];

        setTimeout(() => {
            loadInvoices();
            loadProducts();
            loadDashboard();
        }, 700);

    } catch (error) {
        showError(error.message);
    }
}
    
async function printInvoice(invoiceId) {
    try {
        const response =
            await fetch(`/api/invoices/${invoiceId}`);

        if (!response.ok) {
            throw new Error(
                "Unable to load invoice details"
            );
        }

        const invoice = await response.json();

const invoiceDate =
    formatInvoiceDate(invoice.invoiceDate);

const subTotal =
    formatMoney(invoice.subTotal ?? 0);

const cgst =
    formatMoney(invoice.cgst ?? 0);

const sgst =
    formatMoney(invoice.sgst ?? 0);

const totalAmount =
    formatMoney(invoice.totalAmount ?? 0);

let itemsRows = "";

if (invoice.items && invoice.items.length > 0) {

    invoice.items.forEach(item => {

        itemsRows += `
            <tr>
                <td>${item.productName}</td>
                <td>${formatMoney(item.productPrice)}</td>
                <td>${item.quantity}</td>
                <td>${formatMoney(item.subTotal)}</td>
            </tr>
        `;

    });

} else {

    itemsRows = `
        <tr>
            <td colspan="4" style="text-align:center;">
                No items available
            </td>
        </tr>
    `;

}



        const printWindow = window.open(
            "",
            "_blank",
            "width=900,height=700"
        );

        if (!printWindow) {
            showError(
                "The print window was blocked. Please allow pop-ups and try again."
            );

            return;
        }

        printWindow.document.write(`
            <!DOCTYPE html>

            <html lang="en">

            <head>

                <meta charset="UTF-8">

                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1.0">

                <title>
                    Invoice #${invoice.id}
                </title>

                <style>

                    * {
                        box-sizing: border-box;
                    }

                    body {
                        margin: 0;
                        padding: 30px;
                        font-family: Arial, sans-serif;
                        color: #222;
                        background: #ffffff;
                    }

                    .invoice-container {
                        max-width: 800px;
                        margin: 0 auto;
                        border: 1px solid #dddddd;
                        padding: 32px;
                    }

                    .header {
                        text-align: center;
                        border-bottom: 2px solid #222222;
                        padding-bottom: 18px;
                        margin-bottom: 25px;
                    }

                    .header h1 {
                        margin: 0;
                        font-size: 30px;
                    }

                    .header p {
                        margin: 8px 0 0;
                    }

                    .invoice-meta {
                        display: flex;
                        justify-content: space-between;
                        gap: 20px;
                        margin-bottom: 25px;
                    }

                    .section {
                        margin-bottom: 25px;
                    }

                    .section h3 {
                        margin: 0 0 12px;
                        padding-bottom: 7px;
                        border-bottom: 1px solid #dddddd;
                    }

                    .details-table,
                    .items-table {
                        width: 100%;
                        border-collapse: collapse;
                    }

                    .details-table td {
                        padding: 6px 0;
                        vertical-align: top;
                    }

                    .details-table td:first-child {
                        width: 160px;
                        font-weight: bold;
                    }

                    .items-table th,
                    .items-table td {
                        border: 1px solid #cccccc;
                        padding: 10px;
                        text-align: left;
                    }

                    .items-table th {
                        background: #f2f2f2;
                    }

                    .amount {
                        text-align: right !important;
                    }

                    .total-row {
                        font-weight: bold;
                        font-size: 18px;
                    }

                    .footer {
                        margin-top: 35px;
                        text-align: center;
                        border-top: 1px solid #dddddd;
                        padding-top: 18px;
                    }

                    .print-button {
                        display: block;
                        margin: 25px auto 0;
                        padding: 10px 24px;
                        border: none;
                        border-radius: 5px;
                        background: #222222;
                        color: #ffffff;
                        cursor: pointer;
                        font-size: 16px;
                    }

                    @media print {

                        body {
                            padding: 0;
                        }

                        .invoice-container {
                            border: none;
                        }

                        .print-button {
                            display: none;
                        }

                    }

                </style>

            </head>

            <body>

                <div class="invoice-container">

                    <div class="header">

                        <h1>
                            SMART BILLING APPLICATION
                        </h1>

                        <p>
                            Invoice Receipt
                        </p>

                    </div>

                    <div class="invoice-meta">

                        <div>

                            <strong>
                                Invoice Number:
                            </strong>

                            #${invoice.id}

                        </div>

                        <div>

                            <strong>
                                Date:
                            </strong>

                            ${invoiceDate}

                        </div>

                    </div>

                    <div class="section">

                        <h3>
                            Customer Details
                        </h3>

                        <table class="details-table">

                            <tr>

                                <td>
                                    Name
                                </td>

                                <td>
                                    ${invoice.customerName || "Not available"}
                                </td>

                            </tr>

                            <tr>

                                <td>
                                    Email
                                </td>

                                <td>
                                    ${invoice.customerEmail || "Not available"}
                                </td>

                            </tr>

                            <tr>

                                <td>
                                    Phone
                                </td>

                                <td>
                                    ${invoice.customerPhone || "Not available"}
                                </td>

                            </tr>

                        </table>

                    </div>

                    <div class="section">

                        <h3>
                            Product Details
                        </h3>

                        <table class="items-table">

                            <thead>

                                <tr>
                                    <th>Product</th>
                                    <th>Price</th>
                                    <th>Quantity</th>
                                    <th>Total Amount</th>
                                </tr>

                            </thead>

                            <tbody>

    ${itemsRows}

    <tr>
        <td colspan="3" class="amount">
            Subtotal
        </td>
        <td class="amount">
            ${subTotal}
        </td>
    </tr>

    <tr>
        <td colspan="3" class="amount">
            CGST (9%)
        </td>
        <td class="amount">
            ${cgst}
        </td>
    </tr>

    <tr>
        <td colspan="3" class="amount">
            SGST (9%)
        </td>
        <td class="amount">
            ${sgst}
        </td>
    </tr>

    <tr class="total-row">
        <td colspan="3" class="amount">
            Grand Total
        </td>
        <td class="amount">
            ${totalAmount}
        </td>
    </tr>

</tbody>
                        </table>

                    </div>

                    <div class="footer">

                        <p>
                            Thank you for your purchase!
                        </p>

                    </div>

                    <button
                        class="print-button"
                        onclick="window.print()">
                        Print Invoice
                    </button>

                </div>

            </body>

            </html>
        `);

        printWindow.document.close();

        printWindow.focus();

    } catch (error) {
        showError(error.message);
    }
}
 
async function deleteInvoice(invoiceId) {

    const confirmed = confirm(
        "Are you sure you want to delete this invoice?\n\nStock will be restored automatically."
    );

    if (!confirmed) {
        return;
    }

    try {

        const response = await fetch(`/api/invoices/${invoiceId}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error(
                await getErrorMessage(
                    response,
                    "Unable to delete invoice"
                )
            );
        }

        showSuccess("Invoice deleted successfully");

        setTimeout(() => {
            loadInvoices();
            loadProducts();
            loadDashboard();
        }, 700);

    } catch (error) {
        showError(error.message);
    }
}
async function loadDashboard() {
    try {
        const response = await fetch("/api/dashboard");

        if (!response.ok) {
            throw new Error("Failed to load dashboard data");
        }

        const dashboard = await response.json();

        const setDashboardValue = (elementId, value) => {
            const element = document.getElementById(elementId);

            if (element) {
                element.textContent = value;
            }
        };

        setDashboardValue(
            "dashboardProducts",
            dashboard.totalProducts ?? 0
        );

        setDashboardValue(
            "dashboardCustomers",
            dashboard.totalCustomers ?? 0
        );

        setDashboardValue(
            "dashboardInvoices",
            dashboard.totalInvoices ?? 0
        );

        setDashboardValue(
            "dashboardSales",
            formatMoney(dashboard.totalSales ?? 0)
        );

        setDashboardValue(
            "dashboardLowStock",
            dashboard.lowStockProducts ?? 0
        );

    } catch (error) {
        console.error("Dashboard error:", error);

        const dashboardExists =
            document.getElementById("dashboardProducts");

        if (dashboardExists) {
            showError("Unable to load dashboard data.");
        }
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const dashboardExists =
        document.getElementById("dashboardProducts");

    if (dashboardExists) {
        loadDashboard();
    }
});

async function downloadInvoicePDF(invoiceId) {
    

    try {
        const response = await fetch(`/api/invoices/${invoiceId}`);

        if (!response.ok) {
            throw new Error("Unable to load invoice for PDF");
        }

        const invoice = await response.json();

        if (!window.jspdf) {
            throw new Error("jsPDF library is not loaded");
        }

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();

        let yPosition = 20;

        pdf.setFontSize(20);
        pdf.setFont("helvetica", "bold");

        pdf.text(
            "SMART BILLING APPLICATION",
            105,
            yPosition,
            { align: "center" }
        );

        yPosition += 15;

        pdf.setFontSize(16);

        pdf.text(
            `Invoice #${invoice.id}`,
            20,
            yPosition
        );

        yPosition += 10;

        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");

        pdf.text(
            `Date: ${formatInvoiceDate(invoice.invoiceDate)}`,
            20,
            yPosition
        );

        yPosition += 8;

        pdf.text(
            `Customer Name: ${invoice.customerName || "Not available"}`,
            20,
            yPosition
        );

        yPosition += 8;

        pdf.text(
            `Email: ${invoice.customerEmail || "Not available"}`,
            20,
            yPosition
        );

        yPosition += 8;

        pdf.text(
            `Phone: ${invoice.customerPhone || "Not available"}`,
            20,
            yPosition
        );

        yPosition += 12;

        pdf.setFont("helvetica", "bold");

        pdf.text("Product", 20, yPosition);
        pdf.text("Quantity", 95, yPosition);
        pdf.text("Price", 130, yPosition);
        pdf.text("Subtotal", 165, yPosition);

        yPosition += 3;

        pdf.line(20, yPosition, 195, yPosition);

        yPosition += 8;

        pdf.setFont("helvetica", "normal");

        if (invoice.items && invoice.items.length > 0) {
            invoice.items.forEach(item => {

                if (yPosition > 270) {
                    pdf.addPage();
                    yPosition = 20;
                }

                const productName =
                    item.productName || "Product";

                const quantity =
                    item.quantity || 0;

                const price =
                    item.price ?? item.unitPrice ?? 0;

                const subtotal =
                    item.subTotal ?? item.subtotal ?? 0;

                pdf.text(
                    productName.substring(0, 30),
                    20,
                    yPosition
                );

                pdf.text(
                    String(quantity),
                    100,
                    yPosition
                );

                pdf.text(
                    `Rs. ${Number(price).toFixed(2)}`,
                    130,
                    yPosition
                );

                pdf.text(
                    `Rs. ${Number(subtotal).toFixed(2)}`,
                    165,
                    yPosition
                );

                yPosition += 9;
            });

        } else {
            pdf.text(
                "No invoice items available",
                20,
                yPosition
            );

            yPosition += 10;
        }

        yPosition += 3;

        pdf.line(20, yPosition, 195, yPosition);

        yPosition += 12;

        pdf.setFontSize(14);
        pdf.setFont("helvetica", "bold");

        pdf.text(
            `Grand Total: Rs. ${Number(invoice.totalAmount).toFixed(2)}`,
            195,
            yPosition,
            { align: "right" }
        );

        yPosition += 20;

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "normal");

        pdf.text(
            "Thank you for your purchase!",
            105,
            yPosition,
            { align: "center" }
        );

        pdf.save(`Invoice_${invoice.id}.pdf`);

    } catch (error) {
        console.error("PDF error:", error);
        showError(error.message);
    }
}
function logout() {
    sessionStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
}

