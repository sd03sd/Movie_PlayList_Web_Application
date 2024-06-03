// Import necessary modules
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = 3000;

// Mock user database
const users = [];

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Passport configuration
passport.use(new LocalStrategy(
  { usernameField: 'email' },
  (email, password, done) => {
    const user = users.find(user => user.email === email);
    if (!user) {
      return done(null, false, { message: 'Incorrect email.' });
    }
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) throw err;
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Incorrect password.' });
      }
    });
  }
));

passport.serializeUser((user, done) => {
  done(null, user.email);
});

passport.deserializeUser((email, done) => {
  const user = users.find(user => user.email === email);
  done(null, user);
});

// Routes
app.get('/', (req, res) => {
  res.render('index', { user: req.user });
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});

app.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) { return next(err); }
    if (!user) { return res.redirect('/login'); }
    req.logIn(user, (err) => {
      if (err) { return next(err); }
      return res.redirect('/movies');
    });
  })(req, res, next);
});

app.post('/register', (req, res) => {
  const { email, password, confirmPassword } = req.body;

  if (!email || !password || !confirmPassword) {
    return res.redirect('/signup');
  }

  if (password !== confirmPassword) {
    return res.redirect('/signup');
  }

  const hashedPassword = bcrypt.hashSync(password, 10);
  users.push({ email, password: hashedPassword });
  res.redirect('/login');
});

app.get('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) return next(err);
    res.redirect('/');
  });
});

let userMovieLists = [
    {
        userId: 'user123',
        listName: 'My Favorites',
        movies: ['tt1234567', 'tt9876543']
    },
    {
        userId: 'user456',
        listName: 'To Watch',
        movies: ['tt5678901']
    }
];

// Route to add movie to user's list
app.post('/add-to-list', (req, res) => {
    const { movieId } = req.body;
    const userId = 'user123'; // Dummy user for now, replace with actual user ID from authentication

    // Find user's list or create new list
    const userList = userMovieLists.find(list => list.userId === userId);
    if (userList) {
        userList.movies.push(movieId);
    } else {
        userMovieLists.push({ userId, listName: 'My List', movies: [movieId] });
    }

    res.sendStatus(200);
});

app.post('/add-to-list', (req, res) => {
    const { movieId, visibility } = req.body;
    // Here, you can save the movieId along with its visibility option to your database
    // Depending on the visibility, you can store it as public or private
});

// Route to get user's movie lists
app.get('/lists', (req, res) => {
    const userId = 'user123'; // Dummy user for now, replace with actual user ID from authentication
    const userLists = userMovieLists.filter(list => list.userId === userId);
    res.json(userLists);
});

// Define a route to render the movieScreen.ejs file
app.get('/movies', (req, res) => {
  // Render the movieScreen.ejs file
  res.render('movieScreen');
});

// Define a route to render the playList.ejs file
app.get('/playlist', (req, res) => {
    // Fetch the user's collections from local storage or a database
    console.log(req.user);
    const userId = req.user.email; // Replace with actual user ID from authentication
    const userCollections = userMovieLists.filter(list => list.userId === userId);

    // Format collections for rendering
    const collections = userCollections.map(collection => {
        return {
            name: collection.listName,
            movies: collection.movies.map(movieId => {
                // Fetch movie details from an API or database using movieId
                return {
                    title: `Dummy Title for ${movieId}`, // Replace with actual title
                    imdbID: movieId
                };
            })
        };
    });

    // Render the playList.ejs file with collections data
    res.render('playList', { collections });
});

app.get('/playlist/:listData', (req, res)=>{
    let { listData } = req.params
    listData = JSON.parse(listData)
    console.log(listData);
    res.render('sharedList.ejs', {collections: listData})
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
