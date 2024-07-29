const {generateSalesPDF} = require('../utils/pdfCreator');
const Product = require('../models/userModel');
const excel = require('../utils/excelCreator');
const Order = require('../models/orderModel');  
const User = require('../models/userModel');
const moment = require('moment');

    module.exports = {

        adminDash : async (req,res) => {

            try{

                const currentDate = new Date();
                const lastWeekDate = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
                const lastMonthDate = new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000);
                const lastYearDate = new Date(currentDate.getTime() - 365 * 24 * 60 * 60 * 1000);

                const salesData = await Order.aggregate([
                    {
                        $match : {
                            status : "Order Delivered",
                            createdAt : {$exists : true,$ne : null}
                        }
                    },
                    {$facet: {
                        lastWeek: [
                            { $match: { createdAt: { $gte: lastWeekDate } } },
                            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
                        ],
                        previousWeek : [
                            { $match: { createdAt: { $gte: new Date(lastWeekDate.getTime() - 7 * 24 * 60 * 60 * 1000), $lt: lastWeekDate } } },
                            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
                        ],
                        lastMonth: [
                            { $match: { createdAt: { $gte: lastMonthDate } } },
                            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
                        ],
                        lastYear: [
                            { $match: { createdAt: { $gte: lastYearDate } } },
                            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
                        ]
                    }
                }
            ]);

            // top10 products
            const topProducts = await Order.aggregate([
                {$unwind : '$products'},
                {$group : {
                     _id : '$products.productId',
                    totalSold : {$sum : '$products.quantity'},
                    totalRevenues : {$sum : {$multiply : ['$products.price' , '$products.quantity']}}
                    }
                },
                {$sort : {
                    totalSold : -1
                    }
                },
                {$limit : 10},
                {$lookup : {
                    from : 'products',
                    localField : '_id',
                    foreignField : '_id',
                    as : 'productDetails'
                }},
                {$unwind : '$productDetails'},
                {$project : {
                    name : '$productDetails.productName',
                    image : '$productDetails.images',
                    offerPrice : '$productDetails.discountedPrice',
                    priceMRP : '$productDetails.price',
                    totalQuantity : '$productDetails.stockQuantity',
                    totalSold : 1,
                    totalRevenues : 1
                }}
            ])

            // top 10 categoies
            const topCategories = await Order.aggregate([
                {$unwind : '$products'},
                {$lookup : {
                    from : 'products',
                    localField : 'products.productId',
                    foreignField : '_id',
                    as : 'productDetails'
                }},
                {$unwind : '$productDetails'},
                {$lookup : {
                    from : 'categorys',
                    localField : 'productDetails.category',
                    foreignField : '_id',
                    as : 'categoryDetails'
                }},
                {$unwind : '$categoryDetails'},
                {$group : {
                    _id : '$categoryDetails._id',
                    name : {$first : '$categoryDetails.name'},
                    totalSold : {$sum : '$products.quantity'},
                    totalRevenues : {$sum : {$multiply : ['$products.price' , '$products.quantity']}}
                }},
                {$sort : { totalSold : -1 } },
                {$limit : 10}
            ])

            // top 10 brands
            const topBrands = await Order.aggregate([
                {$unwind : '$products'},
                {$lookup : {
                    from : 'products',
                    localField : 'products.productId',
                    foreignField : '_id',
                    as : 'productDetails'
                }},
                {$unwind : '$productDetails'},
                {$lookup : {
                    from : 'brands',
                    localField : 'productDetails.brand',
                    foreignField : '_id',
                    as : 'brandDetails'
                }},
                {$unwind : '$brandDetails'},
                {$group : {
                    _id : '$brandDetails._id',
                    name : {$first : '$brandDetails.name'},
                    totalSold : {$sum : '$products.quantity'},
                    totalRevenues : {$sum : {$multiply : ['$products.price' , '$products.quantity']}}
                }},
                {$sort : { totalSold : -1 } },
                {$limit : 10}
            ])

            const salesCount = await Order.aggregate([
                {
                    $match :{
                        status : "Order Delivered",
                    }
                },
                {
                    $group : { _id : null , totalSaleCount : {$sum : 1}}
                }
            ]) 

            const customers = await User.find().countDocuments();

            const revenue = await Order.aggregate([
                { $match : {paymentStatus : "Paid"}},
                { $group : {_id : null , amounts : {$sum : "$totalAmount"}}}
            ])

                const lastWeekSales = (salesData[0].lastWeek[0] && salesData[0].lastWeek[0].total) ? salesData[0].lastWeek[0].total : 0;
                const previousWeekSales = (salesData[0].previousWeek[0] && salesData[0].previousWeek[0].total) ? salesData[0].previousWeek[0].total : 0;
                const lastMonthSales = (salesData[0].lastMonth[0] && salesData[0].lastMonth[0].total) ? salesData[0].lastMonth[0].total : 0;
                const lastYearSales = (salesData[0].lastYear[0] && salesData[0].lastYear[0].total) ? salesData[0].lastYear[0].total : 0;
            
                    
            const totalSales = salesCount[0] ? salesCount[0].totalSaleCount : 0;
            const totalRevenue = revenue[0] ? revenue[0].amounts : 0;

            const calculatePercentageChange = (current,previous) => {
                if(previous === 0) return 100;
                return ((current,previous) / previous * 100).toFixed(2);
            }

            const revenueChange = calculatePercentageChange(lastWeekSales , previousWeekSales);
            const customersChange = 14;
            const salesChange = calculatePercentageChange(totalSales , 12);


            const recentSales = await Order.find()
            .sort({createdAt : -1})
            .limit(10)
            .populate('products.productId')

            const salesGraphData = await Order.aggregate([
                {
                    $match: {
                        status: "Order Delivered",
                        createdAt: { $exists: true, $ne: null }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        count: { $sum: 1 }
                    }
                },
                {
                    $sort: { _id: 1 }
                },
                {
                    $limit: 30 // Last 30 days
                }
            ]);
            console.log(salesGraphData,"jjjj");
    
            const salesDates = salesGraphData.map(item => item._id);
            const salesCounts = salesGraphData.map(item => item.count);

            console.log(salesDates,"jjjj");
            console.log(salesCounts,"jjjj");

                res.render('admin/adminDash',{
                    admin : req.session.admin,
                    lastWeekSales,
                    lastMonthSales,
                    lastYearSales,
                    totalSales,
                    customers,
                    totalRevenue,
                    revenueChange,
                    customersChange,
                    salesChange,
                    topProducts,
                    topCategories,
                    topBrands,
                    recentSales,
                    salesDates: JSON.stringify(salesDates),
                    salesCounts: JSON.stringify(salesCounts)
                })

            }catch(error){
                console.error("Error dashboard",error);
            }

        },

        salesReport : async (req,res) => {

            try{

                console.log(req.body,"jlkjlk");
                const {startdate,enddate,downloadformat,timeInterval} = req.body;

                let startDate ,endDate;

                if (startdate && enddate) {
                    startDate = new Date(startdate);
                    endDate = new Date(enddate);
                    endDate.setHours(23, 59, 59, 999);

                var orders = await Order.find(
                     {paymentStatus : "Paid" , createdAt : {$gte : startDate , $lte : endDate}}
                 ).populate('products.productId')
        
                } else if (timeInterval) {
                    const now = moment();
                    switch (timeInterval) {
                        case 'day':
                            startDate = now.startOf('day').toDate();
                            endDate = now.endOf('day').toDate();
                            break;
                        case 'week':
                            startDate = now.startOf('isoweek').toDate();
                            endDate = now.endOf('isoweek').toDate();
                            break;
                        case 'month':
                            startDate = now.startOf('month').toDate();
                            endDate = now.endOf('month').toDate();
                            break;
                        case 'year':
                            startDate = now.startOf('year').toDate();
                            endDate = now.endOf('year').toDate();
                            break;
                        default:
                            return res.status(400).json({ message: "Invalid time interval" });
                    }
                        
                    var orders = await Order.find({paymentStatus: "Paid",
                        createdAt: { 
                            $gte: startDate,
                            $lte: endDate
                        }}).populate('products.productId');

                        console.log(orders,"orderss are there");
                        
                }

                if(orders.length == 0){
                    return res.status(404).json({success : false , message : "there is no order in this date"})
                }

                if(downloadformat === "pdf"){
                    const pdfBuffer = await generateSalesPDF(orders,startDate,endDate);

                    // res headers
                    res.setHeader('Content-type' , 'application/json')
                    res.setHeader(
                        "Content-Disposition",
                        "attachment; filename=sales Report.pdf"
                    )

                    res.status(200).end(pdfBuffer)

                }else if(downloadformat === 'excel'){
                    let totalSales = 0;

                    orders.forEach(order => {
                        totalSales += order.totalAmount || 0
                    });

                    excel.downloadReport(
                        req,
                        res,
                        orders,
                        startDate,
                        endDate,
                        totalSales.toFixed(2),
                        downloadformat
                    )
                }
            }catch(error){
                console.error("Error while getting the pdf ",error);
            }

        } 
    }


    