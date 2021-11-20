function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }
    res.redirect("/")
}

function checkUnAuthenticated(req, res, next) {
    if (!req.isAuthenticated()) {
        next()
    } else {
        res.redirect("/eventPage")
    }
}

function checkEventTime(req, res, next) {
    next();
}

module.exports = { checkAuthenticated: checkAuthenticated, checkUnAuthenticated: checkUnAuthenticated, checkEventTime }