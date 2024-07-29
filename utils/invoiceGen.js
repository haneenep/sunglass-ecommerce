const easyinvoice = require('easyinvoice');
const fs = require('fs');
const path = require('path');


module.exports = {
    generateInvoice : async (orderDetails,index,deliveredProducts) => {

        try{

            const formDate = (date) => {
                return date ? new Date(date).toLocaleDateString('en-US') : '';
            };

            const data = {
                "cusomize" : {

                },
                "images" : {
                    "logo" : fs.readFileSync(path.join(__dirname,'..','public','images','logo(2).png'),'base64'),
                },
                "sender" : {
                    "company" : "VISTAVOGUE",
                    "address" : "16501 Collins Ave, Sunny Isles Beach, FL 33160, India",
                    "zip" : "679560",
                    "city" : "Kozhikode",
                    "country" : "India"
                },
                "client" : {
                    "company" : orderDetails.address.locality,
                    "address" : orderDetails.address.address,
                    "zip" : orderDetails.address.pincode,
                    "city" : orderDetails.address.city,
                    "country" : "India"
                },
                "information" : {
                    "order id" : orderDetails._id,
                    "date" : formDate(orderDetails.createdAt),
                    "invoice date" : formDate(orderDetails.createdAt)
                },
                "products" : deliveredProducts.map(product => ({
                    "quantity" : product.quantity.toString(),
                    "description" : product.productId.productName,
                    "tax-rate" : 1,
                    "price" : product.productId.discountedPrice
                })),
                "bottom-notice" : "Thank you for choosing the VISTAVOGUE",
                "settings" : {
                    "currency" : "INR" ,
                    "tax-notation" : "GST",
                    "margin-top" : 25,
                    "margin-right": 25,
                    "margin-left" : 25,
                    "margin-bottom": 25
                }
            }

            console.log('heere',data)
            const result = await easyinvoice.createInvoice(data);

            if(result.pdf){
                const pdfPath = path.join(__dirname,'..','public','infoPdf',`${orderDetails._id}.pdf`);
                await fs.promises.writeFile(pdfPath,result.pdf,'base64');
                console.log("saved the pdf successfully",pdfPath);
                return pdfPath;
            }else{
                console.error('Error generating PDF ' , result);
                return null;
            }

        }catch(error){
            console.error('Error in generateInvoice',error);
            return null;
        }
    }
}