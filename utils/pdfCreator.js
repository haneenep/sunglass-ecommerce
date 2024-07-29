const PDFDoc = require('pdfkit');
const moment = require('moment');


// Table Row with Bottom Line
function generateTableRow(doc, y, c1, c2, c3, c4, c5, c6, c7, c8) {
    doc
        .fontSize(7)
        .text(c1, 40, y)
        .text(c2, 80, y)
        .text(c3, 130, y)
        .text(c4, 200, y)
        .text(c5, 300, y)
        .text(c6, 380, y)
        .text(c7, 450, y)
        .text(c8, 0, y, { align: "right" })
        .moveTo(50, y + 15)
        .lineTo(560, y + 15)
        .lineWidth(0.5)
        .strokeColor("#ccc")
        .stroke();
}

// Table row without bottom line
function generateTableRowNoLine(doc, y, c1, c2, c3, c4, c5) {
    doc
        .fontSize(7)
        .text(c1, 100, y)
        .text(c2, 100, y)
        .text(c3, 420, y, { width: 90, align: "right" })
        .text(c4, 200, y, { width: 90, align: "right" })
        .text(c5, 0, y, { align: "right" });
}




    const generateSalesPDF = async (orders,startDate,endDate) => {
        return new Promise((resolve,reject) => {

            try{

                const doc = new PDFDoc({ margin : 50})

                const buffers = [];
                doc.on("data", (buffer) => buffers.push(buffer));
                doc.on("end", () => resolve(Buffer.concat(buffers)));
                doc.on("error", (error) => reject(error));

                // Footer for the PDF
                doc.fontSize(15)
                .text(
                    `Sales Report ${startDate.toLocaleDateString() +
                    " " +
                    startDate.toLocaleTimeString()
                    } to ${endDate.toLocaleDateString() + " " + endDate.toLocaleTimeString()
                    }`,
                    50,
                    50,
                    {
                        align: "center",
                        width: 500,
                        color: "white",
                        backgroundColor: "grey",
                    }
                );

                const invoiceTableTop = 100;

                // Table Header
                generateTableRow(
                    doc,
                    invoiceTableTop,
                    "SL No",
                    "Order ID",
                    "User",
                    "Order Date",
                    "Payment Method",
                    "Discount",
                    "coupon Amount",
                    "Amount"
                );

                let i = 0;
                let sum = 0;
                orders.forEach((x) => {
                    var position = invoiceTableTop + (i + 1) * 30;
                    sum += x.totalAmount;
                    sum -= x.couponDiscount;
                    generateTableRow(
                        doc,
                        position,
                        i + 1,
                        x.orderId,
                        x.address.name,
                        x.createdAt.toLocaleDateString() + x.createdAt.toLocaleTimeString(),
                        x.paymentMethod,
                        x.discount,
                        x.couponDiscount,
                        x.totalAmount
                    );
                    i++;
                });
               
                // summary rows
                const subtotalPosition = invoiceTableTop + orders.length * 30;

                const paidToDatePosition = subtotalPosition + 30;

                const duePosition = paidToDatePosition + 30;
                generateTableRowNoLine(doc, duePosition, "", "", "Total", "", sum);

                // end the doc
                doc.end();
            } catch(error){
                reject(error)
            }

        })
    }

module.exports = {generateSalesPDF}



