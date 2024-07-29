

//         document.addEventListener('DOMContentLoaded', (event) => {
//         document.querySelectorAll('.pro-qty-2').forEach(quantityContainer => {
//         const decrButton = quantityContainer.querySelector('.decr.qtybtn');
//         const incButton = quantityContainer.querySelector('.inc.qtybtn');
//         const input = quantityContainer.querySelector('input');
//         const productId = quantityContainer.getAttribute('data-product-id');
//         const productMaxQuantity = parseInt(quantityContainer.getAttribute('data-max-quantity'));
//         const maxQuantity = Math.min(10, productMaxQuantity);
 

//         const updateButtons = () => {
//             let currentValue = parseInt(input.value);
//             decrButton.disabled = currentValue <= 1;
//             incButton.disabled = currentValue >= maxQuantity;
//         };

//         const showSpinner = () => {
//             decrButton.disabled = true;
//             incButton.disabled = true;
//             input.style.display = 'none';
//             const spinner = document.createElement('div');
//             spinner.className = 'spinner';
//             quantityContainer.appendChild(spinner);
//         };

//         const hideSpinner = () => {
//             decrButton.disabled = false;
//             incButton.disabled = false;
//             input.style.display = 'inline-block';
//             const spinner = quantityContainer.querySelector('.spinner');
//             if (spinner) spinner.remove();
//             updateButtons();
//         };


//         const updateCart = (newQuantity) => {
//             console.log('Updating cart with quantity:', newQuantity);
//             showSpinner();
//             fetch('/updateCart', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json',
//                 },
//                 body: JSON.stringify({ productId, quantity: newQuantity }),
//             })
//             .then(response => {
//                 if (!response.ok) {
//                     throw new Error('Network response was not ok');
//                 }
//                 return response.json();
//             })
//             .then(data => {
//                 if (data.success) {
//                     document.querySelector('.cart__total li:nth-child(1) span').textContent = `₹${data.subtotal}`;
//                     document.querySelector('.cart__total li:nth-child(2) span').textContent = `₹${data.total}`;
//                     const productPrice = parseFloat(quantityContainer.closest('tr').querySelector('.product__cart__item__text h5').textContent.replace('₹', ''));
//                     const newProductTotal = (newQuantity * productPrice).toFixed(2);
//                     const productTotalCell = document.querySelector(`[data-product-total="${productId}"]`);
//                 if (productTotalCell) {
//                     productTotalCell.textContent = `₹${newProductTotal}`;
//                  }

//                     showNotification('Cart updated successfully');
//                 } else {
//                     throw new Error(data.message || 'Failed to update cart');
//                 }
//             })
//             .catch(error => {
//                 console.error('Error:', error);
//                 showNotification(error.message, true);
//                 input.value = newQuantity > input.value ? newQuantity - 1 : newQuantity + 1;
//             })
//             .finally(() => {
//                 hideSpinner();
//             });
//         };

//         decrButton.addEventListener('click', () => {
//             let currentValue = parseInt(input.value);
//             if (currentValue > 1) {
//                 input.value = currentValue - 1;
//                 updateCart(currentValue - 1);
//             }
            
//         });

//         incButton.addEventListener('click', () => {
//             let currentValue = parseInt(input.value);
//             if (currentValue < maxQuantity) {
//                 input.value = currentValue + 1;
//                 updateCart(currentValue + 1);
//             }
//             else{
//                 var limit = "Product Quantity limit Exceed";
//                 showNotification(limit,true);
//             }
//         });

//         updateButtons();
//     });

//         const removeButtons = document.querySelectorAll('.remove-item');
//         const modal = document.getElementById('removeModal');
//         const closeModal = document.querySelector('.close');
//         let currentProductRow


//         removeButtons.forEach( button => {
//             button.addEventListener( 'click' ,(event) => {
//                 currentProductRow = event.target.closest('tr');
//                 modal.style.display = 'block';
//             });
//         });


//         closeModal.addEventListener( 'click' , (event) => {
//             modal.style.display = 'none';
//         });


//         window.addEventListener ('click', (event) => {
//             if(event.target == modal){
//                 modal.style.display = 'none';
//             }
//         });


//         document.querySelector('.btn-remove').addEventListener('click', () => {
//             const productId = currentProductRow.querySelector('.pro-qty-2').getAttribute('data-product-id');
//             removeProductFromCart(productId);
//             modal.style.display = 'none';
//         });


//         // document.querySelector('.btn-move').addEventListener('click', () => {
//         //     const productId = currentProductRow.querySelector('.pro-qty-2').getAttribute('data-product-id');
//         //     moveProductToWishlist(productId);
//         //     modal.style.display = 'none';
//         // });


//         const updateCartTotals = (subtotal, total ,isEmpty) => {
//             const subtotalElement = document.querySelector('.cart__total li:nth-child(1) span');
//             const totalElement = document.querySelector('.cart__total li:nth-child(2) span');
            
//             if (subtotalElement) {
//                 subtotalElement.textContent = `₹${parseFloat(subtotal).toFixed(2)}`;
//             }

//             if (totalElement) {
//                 totalElement.textContent = `₹${parseFloat(total).toFixed(2)}`;
//             }
        
//             if (isEmpty) {
//                 window.Location.href = '/emptyCart';
//             }
//         };

//         const removeProductFromCart = (productId) => {
//             fetch(`/removeFromCart/${productId}` , {
//                 method : 'POST' ,
//                 headers : {
//                     'Content-Type' : 'application/json',
//                 },
//             })
//             .then(response => {       
//                 if (!response.ok) {
//                     return response.text().then(text => {
//                         throw new Error(`Server responded with ${response.status}: ${text}`);
//                     });
//                 }
//                 return response.json();
//             }).then(data => {
//                 if(data.success) {
//                     currentProductRow.remove();
//                     updateCartTotals(data.subtotal, data.total , data.isEmpty);
//                     showNotification('Product Removed From Cart');
//                 }else{
//                     showNotification(data.message || 'Failed to remove From Cart' ,true);
//                 }
//             }).catch(error => {
//                 console.error('Error',error);
//                 showNotification(error.message,true);
//             });
//         };
    
//         // const moveProductToWishlist = (productId) => {
//         //     fetch('/moveToWishlist', {
//         //         method: 'POST',
//         //         headers: {
//         //             'Content-Type': 'application/json',
//         //         },
//         //         body: JSON.stringify({ productId }),
//         //     })
//         //     .then(response => {
//         //         if (!response.ok) {
//         //             throw new Error('Network response was not ok');
//         //         }
//         //         return response.json();
//         //     })
//         //     .then(data => {
//         //         if (data.success) {
//         //             currentProductRow.remove();
//         //             showNotification('Product moved to wishlist');
//         //         } else {
//         //             showNotification(data.message || 'Failed to move product', true);
//         //         }
//         //     })
//         //     .catch(error => {
//         //         console.error('Error:', error);
//         //         showNotification(error.message, true);
//         //     });
//         // };


//         const showNotification = (message, isError = false , limit) => {
//             Toastify({
//                 text: message,
//                 duration: 3000,
//                 close: true,
//                 gravity: "top",
//                 position: "right",
//                 backgroundColor: isError ? "red" : "green",
//             }).showToast();
//         };

// });
