<%- include('../layout/userProfileHead') -%>
<%- include('../layout/userHeaderNav') %>

<style>
.custom-modal {
    display: none;
    position: fixed;
    z-index: 1050;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgba(0,0,0,0.4);
    padding-top: 60px;
}

.custom-modal-content {
    background-color: #fff;
    margin: 5% auto;
    padding: 20px;
    border: 1px solid #888;
    width: 40%;
    border-radius: 8px;
}

.custom-modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 10px;
    border-bottom: 1px solid #ddd;
}

.custom-modal-header h5 {
    margin: 0;
}

.custom-modal-header button {
    background: none;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
}

.custom-modal-body {
    padding: 10px 0;
}

.custom-modal-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding-top: 10px;
    border-top: 1px solid #ddd;
}
</style>

<div class="container-fluid">
    <div class="row">
        <div class="col-md-3" id="sidebar">
            <div class="sidebar" style="margin-left: 125px;">
                <% if(locals.user){ %>
                <h2>Account <br> <p> <%= user.name.toUpperCase() %></p><hr></h2>
                <% } %>
                <ul class="sidebar-nav">
                    <li><a href="/userProfile">My Account</a></li>
                    <li><a href="/orders">My Orders</a></li>
                    <li><a href="#">My Wishes</a></li>
                    <li><a href="#">My Wallet</a></li>
                    <li><a href="/shipAddress"></i> My Shipping Addresses</a></li>
                    <li><a href="/logout"style="margin-right: 0;" id="logoutButton" style="color: red;" onclick="confirmLogout(event)">Sign Out</a></li>
                </ul>
            </div>
        </div>
        <div class="col-md-9">
            <h2 class="my-4">Order Details</h2>
            <div class="card mb-4">
                <div class="card-body"> 
                    <p class="card-text"><strong>Order Date:</strong> <%= new Date(order.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) %></p>
                    <p class="card-text"><strong>Status:</strong>
                        <span class="badge rounded-pill p-2 text-uppercase px-3"
                            style="background-color : <%= order.selectedProduct.status === 'Order Delivered' ? 'rgb(40 167 69 / .11)' : order.selectedProduct.status === 'pending' ? 'rgb(255 193 7 / .11)' : 'rgb(220 53 69 / .11)' %>;
                            color: <%= order.selectedProduct.status === 'Order Delivered' ? '#28a745 !important' : order.selectedProduct.status === 'pendings' ? '#ffc107 !important' : '#dc3545 !important' %>">
                            <%= order.selectedProduct.status %>
                        </span>
                    </p>
                </div>
            </div>

            <h4>Product</h4>
            <hr>
            <div class="product-details mb-3">
                <div class="row">
                    <div class="col-md-2">
                        <img src="<%= order.selectedProduct.productId.images[0] %>" alt="<%= order.selectedProduct.productId.productName %>" class="order-image img-fluid" style="border-radius: 0px 3pc; margin-top: 20px; margin-left: 10px;">
                    </div>
                    <div class="col-md-10">
                        <h5><%= order.selectedProduct.productId.productName %></h5>
                        <p><strong>Quantity:</strong> <%= order.selectedProduct.quantity %></p>
                        <p><strong>Price:</strong> ₹<%= order.selectedProduct.price %></p>
                        <p><strong>Total:</strong> ₹<%= order.selectedProduct.price * order.selectedProduct.quantity %></p>
                        <% if (order.selectedProduct.status) { %>
                            <p><strong>Status:</strong> <span class="status-<%= order.selectedProduct.status.toLowerCase() %>"><%= order.selectedProduct.status %></span></p>
                        <% } %>
                        <% if (order.selectedProduct.deliveredOn) { %>
                            <p><strong>Delivered on:</strong> <%= new Date(order.selectedProduct.deliveredOn).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) %></p>
                        <% } %>
                        <!-- New section for action buttons -->
                        <div class="mt-3 text-end">
                            <% if (order.selectedProduct.status === 'Order Delivered') { %>
                                <a type="button" class="btn btn-outline-primary me-2" onclick="genDownloadInvoice('<%= order._id %>','<%= order.orderId %>')">Invoice</a>
                                <button class="btn btn-outline-warning me-2" onclick="openModal()">Return</button>
                                <a href="/products/<%= order.selectedProduct.productId._id %>" class="btn btn-outline-success">Buy Again</a>
                                <% }else if(order.selectedProduct.status === 'Return Requested'){ %>
                                    <a href="/products/<%= order.selectedProduct.productId._id %>" class="btn btn-outline-success">Buy Again</a>
                                <% }else if(order.selectedProduct.status === 'Return Approved' || order.selectedProduct.status === 'Return Rejected' || order.selectedProduct.status === 'canceled'){ %>
                                <a href="/products/<%= order.selectedProduct.productId._id %>" class="btn btn-outline-success">Buy Again</a>
                                <% } else if (order.selectedProduct.status !== 'cancelled') { %>
                                <a href="/products/<%= order.selectedProduct.productId._id %>" class="btn btn-outline-success">Buy Again</a>
                                <button class="btn btn-outline-danger" onclick="confirmCancel('<%= order._id %>', '<%= order.selectedProduct._id %>')">Cancel Order</button>
                            <% } %>
                        </div>
                    </div>
                </div>
            </div>

            <% if (order.otherItems && order.otherItems.length > 1) { %>
                <div class="card mt-4">
                    <div class="card-body">
                        <h5 class="card-title">Other items in this order</h5>
                        <p class="card-text">Order ID # <%= order.orderId %></p><hr>
                        <% order.otherItems.forEach(function(item) { %>
                            <div class="other-item mb-3">
                                <div class="row">
                                    <div class="col-md-2">
                                        <img src="<%= item.image %>" alt="<%= item.name %>" class="order-image img-fluid" style="border-radius: 0px 3pc; margin-top: 30px; margin-left: 20px;"><hr>
                                    </div>
                                    <div class="col-md-10">
                                        <p><strong><%= item.name %></strong></p>
                                        <p><strong>Quantity:</strong> <%= item.quantity %></p>
                                        <p><strong>Price:</strong> ₹<%= item.price * item.quantity %></p>
                                        <a href="/orderDetails/<%= order._id %>?productId=<%= item._id %>" class="btn btn-sm btn-outline-dark">View Details</a><hr>
                                    </div>
                                </div>
                            </div>
                        <% }); %>
                    </div>
                </div>
            <% } %>

            <div class="card mt-4">
                <div class="card-body">
                    <h5 class="card-title">Delivery Address</h5>
                    <p class="card-text"><%= order.address.fullName %></p>
                    <p class="card-text"><%= order.address.locality %>, <%= order.address.city %></p>
                    <p class="card-text"><%= order.address.state %> - <%= order.address.pincode %></p>
                    <p class="card-text">Phone: <%= order.address.phoneNumber %></p>
                </div>
            </div>

            <div class="card mt-4">
                <div class="card-body">
                    <h5 class="card-title">Order Summary</h5>
                    <p class="card-text"><strong>Subtotal: </strong><span style="color: red;">₹<%= order.subtotal %></span></p>
                    <% if(order.couponDiscount){ %>
                    <p class="card-text"><strong>Coupon Discount: </strong>-₹<%= order.couponDiscount %></p>
                    <% } %>
                    <p class="card-text"><strong>Shipping: </strong><span style="color: green;">Free</span></p>
                    <p class="card-text"><strong>Total:</strong> ₹<%= order.totalAmount %></p>
                </div>
            </div>
        </div>
    </div>
</div>

<div id="customModal" class="custom-modal">
    <div class="custom-modal-content">
        <div class="custom-modal-header">
            <h5>Return Request</h5>
            <button onclick="closeModal()">&times;</button>
        </div>
        <div class="custom-modal-body">
            <div class="form-group">
                <label for="reason">Select Return Reason</label>
                <select class="form-control" id="reason" required>
                    <option value="Defective Product">Defective Product</option>
                    <option value="Wrong Product">Wrong Product</option>
                    <option value="Other">Other</option>
                </select>
            </div>
            <div class="form-group">
                <label for="description">Description</label>
                <textarea class="form-control" id="description" rows="4" required></textarea>
            </div>
            <div class="form-group mt-3 text-end">
                <button class="btn btn-primary" onclick="submitReturnRequest()">Return</button>
                <button class="btn btn-secondary" onclick="closeModal()">Close</button>
            </div>
        </div>
    </div>
</div>

<script>
    function openModal() {
        document.getElementById('customModal').style.display = 'block';
    }
    
    function closeModal() {
        document.getElementById('customModal').style.display = 'none';
    }
    
    function submitReturnRequest() {
        const reason = document.getElementById('reason').value;
        const description = document.getElementById('description').value;
    
        if (!reason || !description) {
            Swal.fire({
                text: 'Please fill in all fields.',
                icon: 'warning',
                timer: 3000,
                showConfirmButton: false
            });
            return;
        }
    
        Swal.fire({
            title: 'Submitting return request...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
    
        fetch(`/return/<%= order._id %>/<%= order.selectedProduct._id %>`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason, description })
        })
        .then(response => response.json())
        .then(data => {
            Swal.close();
            closeModal();
            if (data.success) {
                Swal.fire({
                    text: data.message,
                    icon: 'success',
                    timer: 3000,
                    showConfirmButton: false
                });
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                Swal.fire({
                    text: data.error,
                    icon: 'error',
                    timer: 3000,
                    showConfirmButton: false
                });
            }
        })
        .catch(error => {
            Swal.close();
            console.error('Error:', error);
            Swal.fire({
                text: 'An error occurred. Please try again.',
                icon: 'error',
                timer: 3000,
                showConfirmButton: false
            });
        });
    }
    
    function confirmCancel(orderId, productId) {
        Swal.fire({
            title: 'Are you sure?',
            text: "Do you really want to cancel this order?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, cancel it!'
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Canceling order...',
                    allowOutsideClick: false,
                    didOpen: () => {
                        Swal.showLoading();
                    }
                });
    
                fetch(`/cancel-order/${orderId}/${productId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                .then(response => response.json())
                .then(data => {
                    Swal.close();
                    if (data.success) {
                        Swal.fire({
                            text: 'Order has been cancelled.',
                            icon: 'success',
                            timer: 3000,
                            showConfirmButton: false
                        });
                        setTimeout(() => {
                            window.location.reload();
                        }, 1000);
                    } else {
                        Swal.fire({
                            text: data.error,
                            icon: 'error',
                            timer: 3000,
                            showConfirmButton: false
                        });
                    }
                })
                .catch(error => {
                    Swal.close();
                    console.error('Error:', error);
                    Swal.fire({
                        text: 'An error occurred. Please try again.',
                        icon: 'error',
                        timer: 3000,
                        showConfirmButton: false
                    });
                });
            }
        });
    }
    </script>
    
    

<%- include('../layout/userFooterNav') %>
<%- include('../layout/userFoot') %>
<script>
async function genDownloadInvoice(orderId, index) {
    console.log("coming here");
    let timeInterval;

    Swal.fire({
        title: 'Download Started!',
        html: 'I will close in <b></b> milliseconds.',
        timer: 4000,
        timerProgressBar: true,
        didOpen: () => {
            Swal.showLoading();
            const b = Swal.getHtmlContainer().querySelector('b');
            timerInterval = setInterval(() => {
                b.textContent = Swal.getTimerLeft();
            }, 100);
        },
        willClose: () => {
            clearInterval(timeInterval);
        }
    }).then((result) => {
        if (result.dismiss === Swal.DismissReason.timer) {
            console.log("closed the timer");
        }
    });

    try {
        const response = await fetch(`/generateInvoice/${orderId}/${index}`, {
            method: 'get',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        if (response.ok) {
            window.location.href = `/downloadInvoice/${orderId}`
        }
    } catch (error) {
        console.error("Error in downloading the invoice:", error);
    }
}
</script>






<!-- .................................................................... -->


<%- include('../layout/userProfileHead') -%>
<!-- Header Section Begin -->
<%- include('../layout/userHeaderNav') %>
<!-- Header Section End -->

<div class="page-container">
    <!-- Sidebar Begin -->
    <%- include('../layout/userProfileSidebar') -%>
    <!-- Sidebar End -->

    <!-- Main Content Begin -->
    <div class="main-content">
        <div class="orders-header fade-in">
            <h3 class="page-title">My Orders</h3>
            <div class="order-summary">
                <div class="summary-item">
                    <span class="summary-value"><%=order.length%></span>
                    <span class="summary-label">Total Orders</span>
                </div>
                <div class="summary-item">
                    <span class="summary-value">₹<%=order.reduce((sum, order) => sum + order.totalAmount, 0).toLocaleString()%></span>
                    <span class="summary-label">Total Spent</span>
                </div>
            </div>
        </div>
        
        <div class="order-list" id="orderList">
            <% if(order.length > 0) { %>
                <% order.forEach(function(orderItem, index) { %>
                    <div class="order-card animate-on-scroll">
                        <div class="order-card-header">
                            <h2 class="order-id">Order #<%=orderItem._id.toString().slice(-6)%></h2>
                            <span class="order-date"><%=new Date(orderItem.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })%></span>
                        </div>
                        <div class="order-card-body">
                            <% orderItem.products.forEach(function(productItems) { %>
                                <div class="product-item">
                                    <div class="product-image">
                                        <img src="<%=productItems.productId.images[0]%>" alt="<%=productItems.productId.productName%>" loading="lazy">
                                    </div>
                                    <div class="product-details">
                                        <h3 class="product-name"><%=productItems.productId.productName%></h3>
                                        <p class="product-price">₹<%=productItems.price.toLocaleString()%></p>
                                        <p class="product-quantity">Qty: <%=productItems.quantity%></p>
                                    </div>
                                    <div class="product-status">
                                        <span class="status-badge <%=productItems.status.toLowerCase().replace(' ', '-')%>">
                                            <%=productItems.status%>
                                        </span>
                                    </div>
                                </div>
                            <% }); %>
                        </div>
                        <div class="order-card-footer">
                            <div class="order-total">
                                <span>Total:</span>
                                <span class="total-amount">₹<%=orderItem.totalAmount.toLocaleString()%></span>
                            </div>
                            <div class="order-actions">
                                <a href="/orderDetails/<%=orderItem._id%>" class="btn btn-primary">View Details</a>
                                <% if(orderItem.paymentStatus === 'failed'){ %>
                                    <button class="btn btn-secondary repayment-btn" data-id="<%=orderItem._id%>">Repay</button>
                                <% } %>
                            </div>
                        </div>
                    </div>
                <% }); %>
            <% } else { %>
                <div class="no-orders animate-on-scroll">
                    <div class="no-orders-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-shopping-bag"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path></svg>
                    </div>
                    <h2>No orders yet</h2>
                    <p>Looks like you haven't made your first order. Ready to start shopping?</p>
                    <a href="/shop" class="btn btn-primary">Explore Products</a>
                </div>
            <% } %>
        </div>
        
        <div id="pagination" class="pagination fade-in"></div>
    </div>
    <!-- Main Content End -->
</div>

<!-- Footer Section Begin -->
<%- include('../layout/userFooterNav') %>
<!-- Footer Section End -->

<%- include('../layout/userFoot') %>

<style>
    :root {
        --primary-color: #4a90e2;
        --secondary-color: #f39c12;
        --background-color: #f4f7fa;
        --card-background: #ffffff;
        --text-color: #333333;
        --text-light: #777777;
        --success-color: #2ecc71;
        --warning-color: #e74c3c;
    }

    .page-container {
        display: flex;
        min-height: 100vh;
    }

    .main-content {
        flex-grow: 1;
        padding: 2rem;
        transition: all 0.3s ease;
    }

    .orders-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
    }

    .page-title {
        font-size: 2.5rem;
        color: var(--primary-color);
        margin: 0;
    }

    .order-summary {
        display: flex;
        gap: 2rem;
    }

    .summary-item {
        text-align: center;
    }

    .summary-value {
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--primary-color);
    }

    .summary-label {
        font-size: 0.9rem;
        color: var(--text-light);
    }

    .order-card {
        background-color: var(--card-background);
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        margin-bottom: 2rem;
        overflow: hidden;
        transition: all 0.3s ease;
    }

    .order-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 15px rgba(0, 0, 0, 0.1);
    }

    .order-card-header {
        background-color: var(--primary-color);
        color: white;
        padding: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .order-id {
        font-size: 1.2rem;
        margin: 0;
    }

    .order-date {
        font-size: 0.9rem;
    }

    .order-card-body {
        padding: 1rem;
    }

    .product-item {
        display: flex;
        align-items: center;
        margin-bottom: 1rem;
        padding-bottom: 1rem;
        border-bottom: 1px solid #eee;
    }

    .product-item:last-child {
        margin-bottom: 0;
        padding-bottom: 0;
        border-bottom: none;
    }

    .product-image {
        width: 80px;
        height: 80px;
        overflow: hidden;
        border-radius: 8px;
        margin-right: 1rem;
    }

    .product-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    .product-details {
        flex-grow: 1;
    }

    .product-name {
        font-size: 1.1rem;
        margin: 0 0 0.5rem 0;
    }

    .product-price, .product-quantity {
        font-size: 0.9rem;
        color: var(--text-light);
        margin: 0;
    }

    .product-status {
        margin-left: auto;
    }

    .status-badge {
        padding: 0.25rem 0.5rem;
        border-radius: 20px;
        font-size: 0.8rem;
        font-weight: bold;
        text-transform: uppercase;
    }

    .pending { background-color: #ffeaa7; color: #d35400; }
    .confirmed { background-color: #81ecec; color: #00cec9; }
    .shipped { background-color: #74b9ff; color: #0984e3; }
    .delivered { background-color: #55efc4; color: #00b894; }
    .cancelled { background-color: #fab1a0; color: #d63031; }

    .order-card-footer {
        background-color: #f8f9fa;
        padding: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .order-total {
        font-size: 1.2rem;
        font-weight: bold;
    }

    .total-amount {
        color: var(--success-color);
    }

    .order-actions {
        display: flex;
        gap: 1rem;
    }

    .btn {
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-weight: bold;
        text-decoration: none;
        transition: all 0.3s ease;
    }

    .btn-primary {
        background-color: var(--success-color);
        color: white;
    }

    .btn-secondary {
        background-color: var(--secondary-color);
        color: white;
    }

    .btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .no-orders {
        text-align: center;
        padding: 3rem;
        background-color: var(--card-background);
        border-radius: 12px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .no-orders h2 {
        font-size: 2rem;
        color: var(--primary-color);
        margin-bottom: 1rem;
    }

    .no-orders p {
        font-size: 1.1rem;
        color: var(--text-light);
        margin-bottom: 2rem;
    }

    .no-orders-icon {
        width: 100px;
        height: 100px;
        margin: 0 auto 2rem;
        color: var(--primary-color);
    }

    .pagination {
        display: flex;
        justify-content: center;
        margin-top: 2rem;
    }

    .pagination a {
        color: var(--primary-color);
        padding: 0.5rem 1rem;
        text-decoration: none;
        border: 1px solid var(--primary-color);
        margin: 0 0.25rem;
        border-radius: 20px;
        transition: all 0.3s ease;
    }

    .pagination a.active, .pagination a:hover {
        background-color: var(--primary-color);
        color: white;
    }

    /* Animation classes */
    .fade-in {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.5s ease, transform 0.5s ease;
    }

    .fade-in.appear {
        opacity: 1;
        transform: translateY(0);
    }

    .animate-on-scroll {
        opacity: 0;
        transform: translateY(40px);
        transition: opacity 0.8s ease, transform 0.8s ease;
    }

    .animate-on-scroll.appear {
        opacity: 1;
        transform: translateY(0);
    }

    @media (max-width: 768px) {
        .orders-header {
            flex-direction: column;
            align-items: flex-start;
        }

        .order-summary {
            margin-top: 1rem;
        }

        .product-item {
            flex-direction: column;
            align-items: flex-start;
        }

        .product-image {
            margin-bottom: 1rem;
        }

        .product-status {
            margin-left: 0;
            margin-top: 1rem;
        }

        .order-card-footer {
            flex-direction: column;
        }

        .order-total {
            margin-bottom: 1rem;
        }
    }
</style>

<script>
    document.addEventListener('DOMContentLoaded', function() {
        // Intersection Observer for animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('appear');
                }
            });
        }, {
            threshold: 0.1
        });

        // Observe elements with animation classes
        document.querySelectorAll('.fade-in, .animate-on-scroll').forEach(el => {
            observer.observe(el);
        });

        // Repayment button functionality
        const repaymentButtons = document.querySelectorAll('.repayment-btn');
        repaymentButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                const id = this.getAttribute("data-id");
                // Your existing repayment logic here
            });
        });

        // Pagination functionality
        const orderCards = document.querySelectorAll('.order-card');
        const itemsPerPage = 5;
        let currentPage = 1;

        function showPage(page) {
            const startIndex = (page - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;

            orderCards.forEach((card, index) => {
                if (index >= startIndex && index < endIndex) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        }

        function setupPagination() {
            const pageCount = Math.ceil(orderCards.length / itemsPerPage);
            const paginationContainer = document.getElementById('pagination');
            paginationContainer.innerHTML = '';

            for (let i = 1; i <= pageCount; i++) {
                const link = document.createElement('a');
                link.href = '#';
                link.innerText = i;

                if (i === currentPage) {
                    link.classList.add('active');
                }

                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    if (currentPage !== i) {
                        currentPage = i;
                        showPage(currentPage);
                        updatePaginationUI();
                        scrollToTop();
                    }
                });

                paginationContainer.appendChild(link);
            }
        }

        function updatePaginationUI() {
            const paginationLinks = document.querySelectorAll('.pagination a');
            paginationLinks.forEach((link, index) => {
                if (index + 1 === currentPage) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });
        }

        function scrollToTop() {
            const orderList = document.getElementById('orderList');
            orderList.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        showPage(currentPage);
        setupPagination();

        // Add loading animation
        function showLoading() {
            const loadingOverlay = document.createElement('div');
            loadingOverlay.classList.add('loading-overlay');
            loadingOverlay.innerHTML = '<div class="loader"></div>';
            document.body.appendChild(loadingOverlay);
        }

        function hideLoading() {
            const loadingOverlay = document.querySelector('.loading-overlay');
            if (loadingOverlay) {
                loadingOverlay.remove();
            }
        }

        // Simulate loading when changing pages
        const paginationContainer = document.getElementById('pagination');
        paginationContainer.addEventListener('click', (e) => {
            if (e.target.tagName === 'A') {
                showLoading();
                setTimeout(() => {
                    hideLoading();
                }, 500); // Adjust the duration as needed
            }
        });

        // Update order status with animation
        function updateOrderStatus(orderId, newStatus) {
            const statusBadge = document.querySelector(`[data-order-id="${orderId}"] .status-badge`);
            if (statusBadge) {
                statusBadge.classList.add('status-updating');
                setTimeout(() => {
                    statusBadge.className = `status-badge ${newStatus.toLowerCase().replace(' ', '-')}`;
                    statusBadge.textContent = newStatus;
                    statusBadge.classList.remove('status-updating');
                }, 300);
            }
        }

        // Example usage: updateOrderStatus('order123', 'Shipped');

        // Add to cart functionality (for demo purposes)
        const addToCartButtons = document.querySelectorAll('.btn-add-to-cart');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.preventDefault();
                const productId = this.getAttribute('data-product-id');
                this.classList.add('adding');
                setTimeout(() => {
                    this.classList.remove('adding');
                    this.classList.add('added');
                    this.textContent = 'Added to Cart';
                }, 1000);
                // Here you would typically send an AJAX request to add the item to the cart
            });
        });
    });
</script>

<style>
    /* ... (previous styles remain the same) */

    /* Loading overlay */
    .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(255, 255, 255, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }

    .loader {
        border: 5px solid #f3f3f3;
        border-top: 5px solid var(--primary-color);
        border-radius: 50%;
        width: 50px;
        height: 50px;
        animation: spin 1s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    /* Status update animation */
    .status-badge {
        transition: all 0.3s ease;
    }

    .status-updating {
        transform: scale(0.8);
        opacity: 0.5;
    }

    /* Add to cart button animation */
    .btn-add-to-cart {
        position: relative;
        overflow: hidden;
    }

    .btn-add-to-cart::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 5px;
        height: 5px;
        background: rgba(255, 255, 255, 0.5);
        opacity: 0;
        border-radius: 100%;
        transform: scale(1, 1) translate(-50%);
        transform-origin: 50% 50%;
    }

    @keyframes ripple {
        0% {
            transform: scale(0, 0);
            opacity: 1;
        }
        20% {
            transform: scale(25, 25);
            opacity: 1;
        }
        100% {
            opacity: 0;
            transform: scale(40, 40);
        }
    }

    .btn-add-to-cart.adding::after {
        animation: ripple 1s ease-out;
    }

    .btn-add-to-cart.added {
        background-color: var(--success-color);
    }
</style>

<!-- Add this to your HTML structure where appropriate -->
<button class="btn btn-primary btn-add-to-cart" data-product-id="123">Add to Cart</button>



<!-- ........................... -->
<%- include('../layout/userProfileHead') -%>
<!-- Header Section Begin -->
<%- include('../layout/userHeaderNav') %>
<!-- Header Section End -->

<div class="page-container">
    <!-- Sidebar Begin -->
    <%- include('../layout/userProfileSidebar') -%>
    <!-- Sidebar End -->

    <!-- Main Content Begin -->
    <div class="main-content">
        <h3 class="mb-4">ORDERS</h3><hr>
        <div class="order-list">
            <% if(order.length > 0) { %>                
            <% order.forEach(function(orderItem) { %>
                <% orderItem.products.forEach(function(productItems) { %>
                <div class="order-item">
                    <% if(orderItem.paymentStatus === 'failed'){ %>
                        <div class="row">
                            <div class="col-md-2">
                                <img src="<%= productItems.productId.images[0] %>" style="border-radius: 0px 3pc; margin-top: 50px;" alt="Product" class="order-image">
                            </div>
                            <div class="col-md-10">
                                <div class="order-details">
                                    <div>
                                        <p><strong><%= productItems.productId.productName %></strong></p>
                                        <p>
                                            <% if(orderItem.paymentStatus === 'failed'){ %>
                                                <span class="status-failed">Failed</span>
                                            <% } %>
                                        </p>
                                        <p><strong>Items:</strong> <%= orderItem.products.length %></p>
                                        <p><strong>Total:</strong> ₹<%= orderItem.totalAmount %></p>
                                        <p><strong>Order Date:</strong> <%= new Date(orderItem.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) %></p>
                                    </div>
                                    <div>
                                        <a href="/orderDetails/<%= orderItem._id %>?productId=<%= productItems.productId._id %>" class="view-order-btn">View Order</a><br><br>
                                        <button id="repayment-button" class="repayment-btn" data-id="<%= orderItem._id %>">Repayment</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    <% }else{ %>
                        <div class="row">
                            <div class="col-md-2">
                                <img src="<%= productItems.productId.images[0] %>" style="border-radius: 0px 3pc; margin-top: 50px;" alt="Product" class="order-image">
                            </div>
                            <div class="col-md-10">
                                <div class="order-details">
                                    <div>
                                        <p><strong><%= productItems.productId.productName %></strong></p>
                                        <p>
                                            <% if (productItems.status === "pending") { %>
                                            <span class="status-received"><%= productItems.status %></span>
                                            <% }else if (productItems.status === "Order Confirmed") { %>
                                            <span class="status-confirmed"><%= productItems.status %></span>
                                            <% }else if (productItems.status === "Order Shipped") { %>
                                            <span class="status-shipped"><%= productItems.status %></span>
                                            <% }else if (productItems.status === "Order Delivered") { %>
                                            <span class="status-delivered"><%= productItems.status %></span>
                                            <% }else if (productItems.status === "canceled") { %>
                                                <span class="status-cancelled">Cancelled</span>
                                            <% }else{ %>
                                            <span class="status-delivered">Order Delivered</span>
                                            <% } %>
                                        </p>
                                        <p>
                                            <% if(orderItem.paymentStatus === 'failed'){ %>
                                                <span class="status-failed">Failed</span>
                                            <% } %>
                                        </p>
                                        <p><strong>Items:</strong> <%= orderItem.products.length %></p>
                                        <p><strong>Total:</strong> ₹<%= orderItem.totalAmount %></p>
                                        <p><strong>Order Date:</strong> <%= new Date(orderItem.createdAt).toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }) %></p>
                                    </div>
                                    <div>
                                        <a href="/orderDetails/<%= orderItem._id %>?productId=<%= productItems.productId._id %>" class="view-order-btn">View Order</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    <% } %> 
                </div>
                <% }); %>
            <% }); %>
            <% }else{ %>
                <div class="order-item">
                    <div class="row">
                        <div class="col-md-10">
                            <div class="order-details">
                                <div>
                                    <p><strong>No Orders Yet !! </strong></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            <% } %>
        </div>
    </div>
    <!-- Main Content End -->
</div>

<!-- Footer Section Begin -->
<%- include('../layout/userFooterNav') %>
<!-- Footer Section End -->

<%- include('../layout/userFoot') %>

<script>
  const btn =  document.getElementById('repayment-button');
    btn.onclick = function (){
        const id = btn.getAttribute("data-id");

        fetch(`/repayment/${id}` , {
            method : 'POST'
        })
        .then(response => response.json())
        .then(data => {
            if(data.success){
                var options = {
                    "key": data.key, 
                    "amount": data.amount, 
                    "currency": data.currency,
                    "order_id": data.razorpayOrderId,
                    "name": "VISTAVOGUE",
                    "description": "Test Transaction",
                    "image" : 'images/logs.png',
                    "handler" : function (response){
                        fetch('/create-repayment', {
                            method : 'POST',
                            headers : {
                                'Content-type' : 'application/json'
                            },
                            body : JSON.stringify({
                                razorpayOrderId: response.razorpay_order_id,
                                razorpayPaymentId: response.razorpay_payment_id,
                                razorpaySignature: response.razorpay_signature,
                                orderId : data.orderId,
                                payment : true
                            })
                        })
                        .then(response => response.json())
                        .then(result => {
                            if(result.success){
                                Swal.fire({
                                    title: 'Success!',
                                    text: 'Payment successful',
                                    icon: 'success',
                                    confirmButtonText: 'OK'
                                }).then((result) => {
                                    if (result.isConfirmed) {
                                        window.location.reload();
                                    }
                                });
                            } else {
                                Swal.fire({
                                    title: 'Error!',
                                    text: 'Payment failed. Something went wrong.',
                                    icon: 'error',
                                    confirmButtonText: 'OK'
                                });
                            }
                        })
                    },
                    "prefill": {
                        "name": "kaka",
                        "email": "kaka1email@example.com",
                        "contact": "9990000999"
                    },
                    "notes": {
                        address: "Razor pay Corporate Office",
                    },
                    "theme": {
                        "color": "#0D0D0D"
                    }
                };

                var razor = new Razorpay(options);
                razor.open();
            }
        }).catch(error => {
            console.error("errrrr",error);
            swal.fire({
                title: 'Error',
                text: error.message || 'An error occurred while placing the order.',
                icon: 'error',
                confirmButtonText: 'OK'
            })
        })
}


</script>

<script>
document.addEventListener('DOMContentLoaded', function() {
const orderItems = document.querySelectorAll('.order-item');
const itemsPerPage = 5; // You can adjust this number
let currentPage = 1;

function showPage(page) {
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    orderItems.forEach((item, index) => {
        if (index >= startIndex && index < endIndex) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

function setupPagination() {
    const pageCount = Math.ceil(orderItems.length / itemsPerPage);
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination';

    for (let i = 1; i <= pageCount; i++) {
        const link = document.createElement('a');
        link.href = '#';
        link.innerText = i;

        if (i === currentPage) {
            link.classList.add('active');
        }

        link.addEventListener('click', (e) => {
            e.preventDefault();
            currentPage = i;
            showPage(currentPage);

            document.querySelectorAll('.pagination a').forEach(a => a.classList.remove('active'));
            e.target.classList.add('active');
        });

        paginationContainer.appendChild(link);
    }

    document.querySelector('.order-list').after(paginationContainer);
}

showPage(currentPage);
setupPagination();
});
</script>

<style>
.pagination {
display: flex;
justify-content: center;
align-items: center;
margin-top: 20px;
}

.pagination a {
color: #333;
text-decoration: none;
padding: 8px 16px;
margin: 0 4px;
border: 1px solid #ddd;
border-radius: 50%;
min-width: 40px;
height: 40px;
display: flex;
align-items: center;
justify-content: center;
font-weight: bold;
}

.pagination a.active {
background-color: #ffffff;
color: rgb(0, 0, 0);
border-color: #000000;
}

.pagination a:hover:not(.active) {
background-color: #f8f9fa;
}

.pagination .next {
border: none;
font-size: 1.2em;
}
</style>