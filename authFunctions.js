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
    let startTime = new Date(Date.parse('20 November 2021 06:30'))
    let closeTime = new Date(Date.parse('20 November 2021 07:00'))
    console.log(startTime)
    let currentDate = new Date();
    if (currentDate < startTime) {
        req.flash('bigMessage', 'Are you excited for the event? \n Come back again on 20th November, 18:00 hours, when the event will start.')
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