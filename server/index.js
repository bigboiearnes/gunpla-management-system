const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors')
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const authenticateToken = require('./authenticateToken')

const Kit = require('./model/Kit');
const User = require ('./model/User');
const Collection = require('./model/Collection');

const app = express();
const port = 4000;

// Connect to MongoDB
mongoose.connect('mongodb://connorearneybs3221:IwT3a5xY75iviD3407DWDJBUPzcMYZPyCK6rdkSvhPPKnnkNDdHKNh9aVVwScgnBz6Es4EfTr1pxACDbg8AbXw==@connorearneybs3221.mongo.cosmos.azure.com:10255/universitywork?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@connorearneybs3221@')
  .then(() => console.log('Connected to MongoDB'))
  .catch(error => console.error('Error connecting to MongoDB:', error));

// App Middleware
app.use(bodyParser.json());
app.use(cors())

//Fetches kit using kitId
app.get('/api/kits/:kitId', async (req, res) =>{
  try {
    // Find kit in database using kitId
    const kit = await Kit.findOne({ kitId: req.params.kitId });

    // If there is no kit, return error
    if (!kit) {
      return res.status(404).json({ error: 'Kit not found' });
    }
    res.json(kit);
  } catch (error) {
    console.error('Error occurred while fetching kit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//Fetches user data using token
app.get('/api/user', authenticateToken, async (req, res) => {
  try {
    // Set username as username derived from token
    const username = req.user.username

    // Take details from user in database
    const user = await User.findOne({ username: username})

    // If the user is not found, return error
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Return users username and email
    res.json({
      username: user.username,
      email: user.email
    });
    
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Adds gunpla to user collection, uses token to derive user
app.post('/api/user/collection', authenticateToken, async (req, res) => {
  try {
    const { kitId, status, rating, review } = req.body;
    const username = req.user.username;

    let userCollection = await Collection.findOne({ username });

    // If user collection doesn't exist, create a new one
    if (!userCollection) {
      userCollection = new Collection({ username, collection: [] });
    }

    // Find index of the item in the collection array with the provided kitId
    const index = userCollection.collection.findIndex(item => item.kitId === kitId);

    // If an item with provided kitId exists, update it
    if (index !== -1) {
      userCollection.collection[index].status = status;
      userCollection.collection[index].rating = rating;
      if (review !== undefined) {
        userCollection.collection[index].review = review;
      }
    } else {
      // If item with provided kitId doesn't exist, add it to the collection array
      userCollection.collection.push({ kitId, status, rating, review });
    }

    // Save the updated collection
    await userCollection.save();

    res.json(userCollection);
  } catch (error) {
    console.error('Error updating user collection:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


//Fetches user using username
app.get('/api/user/:username', async (req, res) =>{
  try {
    // Use username to find user in the database
    const user = await User.findOne({ username: req.params.username });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Set sensitive data to null so they can't be stolen
    user.password = null
    user.email = null
    
    res.json(user);
  } catch (error) {
    console.error('Error occurred while fetching kit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//Registers the user
app.post('/api/register', async (req, res) =>{
  try {
    const { username, email, password } = req.body;

    // Sets register date as current date
    const registerDate = new Date();

    // Encrypts password using a hash function
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save new user into the database
    const newUser = new User({ username, email, password: hashedPassword, registerDate });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//Logs in the user
app.post('/api/login', async (req, res) =>{
  try {
    const { username, password } = req.body;
    const user = await User.findOne ({ username });
    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password '});
    }
    // Make sure password hashes match
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid username or password '});
    }

    // Provide token for user session
    const token = jwt.sign(
      { username: user.username }, 
      'your-secret-key', 
      { expiresIn: '7d' }
    );

    res.json({ message: 'Login successful', token });
  } catch (error) {
      console.error('Error occurred during login:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
