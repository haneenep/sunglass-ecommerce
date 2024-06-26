

module.exports = {
    
    checkOutGet : (req,res) => {

        const user = req.session.user;

        res.render('user/checkout',{user});
    }
}