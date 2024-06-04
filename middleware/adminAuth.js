    require('dotenv').config();

    module.exports = {
    isAdminAuthenticated: (req, res, next) => {
        const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

        if (req.body.email === ADMIN_EMAIL && req.body.password === ADMIN_PASSWORD) {
        req.session.admin = true;
        return next();
        }
        req.flash('error_msg', 'Invalid email/password');
        res.redirect('/admin/login');
    },

    ensureAdmin: (req, res, next) => {
        if (req.session.admin) {
        return next();
        }
        res.redirect('/admin/login');
    },
    };
