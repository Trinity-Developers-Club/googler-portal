const express = require('express');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt')
const mongoose = require('mongoose');
const passport = require("passport")
const flash = require("express-flash")
const session = require("express-session")
var Ddos = require('ddos')

// DDOS PROTECTION
var ddos = new Ddos;

const app = express();

const teamsCollection = require('./models/teams.js');
const questionCollection = require('./models/questions.js');
const { checkAuthenticated, checkUnAuthenticated, checkEventTime } = require('./authFunctions')

dotenv.config()

// CONNECTION
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}, (err) => {
    if (err)
        console.log(`Error ${err}`);
    else
        console.log("Connected to MongoDB");

})
app.use(express.urlencoded({ extended: false }));
// app.use(express.json())
app.use(ddos.express)
app.set('view engine', 'ejs')
app.use(express.static(__dirname + '/public'))

app.set('trust proxy', 1)
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

const initializePassport = require('./passport-config');

initializePassport(passport,
    teamName => teamsCollection.findOne({ teamName: teamName.toLowerCase() }).then(team => team),
    id => teamsCollection.findById(id).then(team => team)
)

app.post('/register', checkUnAuthenticated, (req, res) => {
    var teamName = (req.body.teamName).toLowerCase();
    teamsCollection.findOne({ teamName: teamName }).then(team => {
        if (team) return res.status(400).send({ done: false, message: 'Team already Exists.' })
        let data = {}
        data.teamName = teamName
        data.password = bcrypt.hashSync(req.body.password, 10)
        new teamsCollection(data).save((err, registeredTeam) => {
            if (err) {
                console.log(`Error ${err}`);
                res.send({ done: false, message: 'Unknown Error Occured!' })
            }
            else {
                res.send({ done: true, registeredTeam, message: 'Participant Registered Successfully' });
            }
        })
    })
})

app.post("/login", checkEventTime, passport.authenticate('local', {
    successRedirect: '/eventPage',
    failureRedirect: '/',
    failureFlash: true
}))

app.get('/', checkEventTime, checkUnAuthenticated, (req, res) => {
    res.render('index.ejs')
})

app.get('/eventPage', checkEventTime, checkAuthenticated, (req, res) => {
    // We find the user first
    teamsCollection.findOne({ teamName: req.user.teamName }).then(team => {
        if (!team) return res.status(400).send({ done: false, message: 'No Team found with the given teamName.' })
        // We find the currentQuestion of user
        questionCollection.findOne({ questionNumber: team.currentQuestion }).then(question => {
            if (!question) {
                req.flash('bigMessage', 'Kuddos!! You have answered all the questions. Go enjoy the weekend with some Netflix or better, "GET CODING"')
                return res.redirect('/message')
            }
            if (Math.floor(Math.random() * 10) >= 8) {
                req.flash('display', 'true')
            }
            res.render('eventPage.ejs', { team, question })
        })
    })


})

app.post('/addQuestion', (req, res) => {
    let data = {}
    data.questionNumber = req.body.questionNumber;
    data.question = req.body.question;
    data.answer = bcrypt.hashSync(req.body.answer, 10);
    new questionCollection(data).save((err, question) => {
        if (err) {
            console.log(`Error ${err}`);
            res.send({ done: false, message: 'Unknown Error Occured!' });
        }
        else {
            res.send({ done: true, message: 'Question created Successfully!', question });
        }
    });
})

app.post('/checkAnswer', checkEventTime, checkAuthenticated, (req, res) => {
    let submissionTime = new Date();
    if (req.body.answer.length == 0) {
        req.flash('error', 'No-uh Answer is not empty string.')
        return res.redirect('/eventPage')
    }
    // First we find the team
    teamsCollection.findOne({ teamName: req.user.teamName }).then(team => {
        if (!team) return res.status(400).send({ done: false, message: 'No Team found with the given teamName.' })
        // We find the currentQuestion of user
        questionCollection.findOne({ questionNumber: team.currentQuestion }).then(question => {
            if (!question) {
                req.flash('bigMessage', 'Kuddos!! You have answered all the questions. Go enjoy with some Netflix or better get Coding!')
                return res.redirect('/message')
            }

            const verifiedFlag = bcrypt.compareSync(req.body.answer, question.answer)
            if (!verifiedFlag) {
                req.flash('error', 'Uhm! Wrong Answer... Try Again')
                return res.redirect('/eventPage')
            }
            team.score = team.score + 10;
            team.currentQuestion++;
            team.lastAnswered = `${submissionTime.getHours()} : ${submissionTime.getMinutes()} : ${submissionTime.getSeconds()} `;
            team.save((err, team) => {
                if (err) return res.send('SOME SPECIAL ERROR WHILE SAVING')
                if (team) {
                    req.flash('success', 'Awesome! Right Answer.')
                    return res.redirect('/eventPage')
                }
            })
        })
    })

});

app.get('/message', (req, res) => {
    res.render('bigMessage.ejs')
})

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server is listening");
});




