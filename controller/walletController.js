const Wallet = require('../models/walletModel');

module.exports = {

    walletGet: async (req, res) => {

        try {

            const user = req.session.user;
            const wallet = await Wallet.findOne({ user: user }).sort({ 'transactions.createdAt': -1 });

            if (!wallet) {
                return res.render('user/wallet', { wallet: null, user, summary: null });
            }

            const currentDate = new Date();
            const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            const lastDayOfLastMonth = new Date(firstDayOfMonth);
            lastDayOfLastMonth.setDate(0);
            const firstDayOfLastMonth = new Date(lastDayOfLastMonth.getFullYear(), lastDayOfLastMonth.getMonth(), 1);

            const summary = {
                thisMonth: {
                    totalIn: 0,
                    totalOut: 0
                },
                lastMonth: {
                    totalIn: 0,
                    totalOut: 0
                },
                totalIn: 0,
                totalOut: 0
            };

            wallet.transactions.forEach(transaction => {
                const amount = transaction.amount;
                if (transaction.type === 'credit') {
                    summary.totalIn += amount;
                    if (transaction.createdAt >= firstDayOfMonth) {
                        summary.thisMonth.totalIn += amount;
                    } else if (transaction.createdAt >= firstDayOfLastMonth && transaction.createdAt < firstDayOfMonth) {
                        summary.lastMonth.totalIn += amount;
                    }
                } else {
                    summary.totalOut += amount;
                    if (transaction.createdAt >= firstDayOfMonth) {
                        summary.thisMonth.totalOut += amount;
                    } else if (transaction.createdAt >= firstDayOfLastMonth && transaction.createdAt < firstDayOfMonth) {
                        summary.lastMonth.totalOut += amount;
                    }
                }
            });

            res.render('user/wallet', { wallet, user, summary });

        } catch (error) {
            console.error("Error while getting the wallet", error);
            res.render('500');
        }
    }
};