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
    let startTime = new Date(Date.parse('17 June 2021 19:00'))
    let closeTime = new Date(Date.parse('17 June 2021 19:30'))
    console.log(startTime)
    let currentDate = new Date();
    if (currentDate < startTime) {
        req.flash('bigMessage', 'You seem Excited, but We\'re sorry event will start on 17th June 2021 at 19:00 Hours.')
        return res.redirect('/message')
    }
    else if (currentDate > closeTime) {
        req.flash('bigMessage', 'Event is over. We hope you participated and enjoyed.')
        return res.redirect('/message')
    }
    else if (currentDate >= startTime && currentDate <= closeTime) {
        next()
    }
}

module.exports = { checkAuthenticated: checkAuthenticated, checkUnAuthenticated: checkUnAuthenticated, checkEventTime }