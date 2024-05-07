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



// Searches kits for query and returns matches
app.get('/api/kits/search', async (req, res) => {
  const { query, page, pageSize } = req.query;
  const pageNumber = parseInt(page, 10) || 1;
  const size = parseInt(pageSize, 10) || 10;

  try {
    // Calculate the number of documents to skip based on the page number and page size
    const skip = (pageNumber - 1) * size;

    let kits;

    // Search by kitId first
    kits = await Kit.find({ kitId: { $regex: query, $options: 'i' } }).skip(skip).limit(size);

    // If no results found by kitId, then search by kitName and gundamModel
    if (kits.length === 0) {
      kits = await Kit.find({
        $or: [
          { kitName: { $regex: query, $options: 'i' } },
          { gundamModel: { $regex: query, $options: 'i' } }
        ]
      }).skip(skip).limit(size);
    }

    res.json(kits);
  } catch (error) {
    console.error('Error searching for kits:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST route to like a review
app.post('/api/kits/review/like', authenticateToken, async (req, res) => {
  const { kitId, username } = req.body;
  const likerUsername = req.user.username;
  try {
    let kit = await Kit.findOne({ kitId });
    if (!kit) {
      return res.status(404).json({ error: 'Kit not found' });
    }

    // Find the review in the usersReviewed array
    const review = kit.usersReviewed.find(review => review.username === username);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if the user already dislikes the review
    const dislikeIndex = review.reviewDislikes.indexOf(likerUsername);
    if (dislikeIndex !== -1) {
      review.reviewDislikes.splice(dislikeIndex, 1);
    }

    // Check if the user already likes the review
    const likeIndex = review.reviewLikes.indexOf(likerUsername);
    if (likeIndex === -1) {
      review.reviewLikes.push(likerUsername);
    }

    await kit.save();

    res.status(200).json({ message: 'Review liked successfully' });
  } catch (error) {
    console.error('Error occurred while liking review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST route to dislike a review
app.post('/api/kits/review/dislike', authenticateToken, async (req, res) => {
  const { kitId, username } = req.body;
  const dislikerUsername = req.user.username;
  try {
    let kit = await Kit.findOne({ kitId });
    if (!kit) {
      return res.status(404).json({ error: 'Kit not found' });
    }

    // Find the review in the usersReviewed array
    const review = kit.usersReviewed.find(review => review.username === username);
    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if the user already likes the review
    const likeIndex = review.reviewLikes.indexOf(dislikerUsername);
    if (likeIndex !== -1) {
      review.reviewLikes.splice(likeIndex, 1);
    }

    // Check if the user already dislikes the review
    const dislikeIndex = review.reviewDislikes.indexOf(dislikerUsername);
    if (dislikeIndex === -1) {
      review.reviewDislikes.push(dislikerUsername);
    }

    await kit.save();

    res.status(200).json({ message: 'Review disliked successfully' });
  } catch (error) {
    console.error('Error occurred while disliking review:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

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

// Checks whether token is valid, for automatic logouts
app.get('/api/user/check-token', async (req, res) =>{
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  try {
    const user = jwt.verify(token, 'your-secret-key');
    req.user = user; // Attach user to request object for later use
    res.sendStatus(200); // Token is valid, send success response
  } catch (error) {
    console.error('Error verifying token:', error);
    res.status(403).json({ error: 'Forbidden' });
  }
});

// Allows a user to update their details
app.post('/api/user/update', authenticateToken, async (req, res) => {
  try {
    const { username, email, password, biography } = req.body;

    // If a username does not match its token, forbid
    if (req.user.username !== username ) {
      return res.status(403).json({error: 'Forbidden'});
    }

    const updatedUser = await User.findOneAndUpdate(
      { username }, // Find user by username
      { email, password, biography }, // Update user details
      { new: true } // Return updated user
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found '});
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Adds gunpla to user collection, uses token to derive user
app.post('/api/user/collection/add', authenticateToken, async (req, res) => {
  try {
    const { kitId, status, rating, review } = req.body;
    const username = req.user.username;

    if ((rating || status) > 10 || (rating || status) < 0 ) {
      res.status(403).json({error: 'Forbidden'});
    }

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
      // If review does not exist then ignore rest of code
      if (review !== undefined) {
        // If reviewed is marked for deletion, set it as empty, this way it should not be read
        if (review === "DELETE") {
          console.log(review)
          userCollection.collection[index].review = null;
        } else {
          // If the review exists
          userCollection.collection[index].review = review;
          // Find the kit that matches
          let kit = await Kit.findOne({ kitId });
          if (kit) {
            // find existing review
            const reviewFind = kit.usersReviewed.find(review => review.username === username);
            console.log(reviewFind);
            // if review doesn't exist in database then push link to review to kit
            if (!reviewFind) {
              kit.usersReviewed.push({ username, reviewLikes: [username], reviewDislikes: [] });
              await kit.save();
            } else {
              userCollection.collection[index].review = review;
            }
            
        }
      }
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

// Removes kit from user collection, uses token to derive user
app.post('/api/user/collection/remove', authenticateToken, async (req, res) => {
  try {
    const { kitId } = req.body;
    const username = req.user.username;

    let userCollection = await Collection.findOne({ username });

    if (!userCollection) {
      return res.status(404).json({error: 'User not found'});
    }

    const index = userCollection.collection.findIndex(item => item.kitId === kitId);

    if (index !== -1) {
      userCollection.collection[index].deleteOne();
    } else {
      return res.status(404).json({error: 'Kit not found in collection'})
    }

    await userCollection.save();

    res.status(200);
    } catch (error) {
      console.error('Error occured whilst removing kit from collection:', error);
      res.status(500).json({ error: 'Internal server error'})
    }
});


//Fetch users collection using username
app.get('/api/user/collection/:username', async (req, res) => {
  try {
    const userCollection = await Collection.findOne({ username: req.params.username});
    if (!userCollection) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(userCollection);
  } catch (error) {
    console.error('Error occured whilst fetching collection:', error);
    res.status(500).json({ error: 'Internal server error'})
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
    const { username, email, password, biography } = req.body;

    // Check if username is taken
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ error: 'Username already taken'})
    }

    // Check if email is taken
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: 'Email already taken'})
    }

    // Sets register date as current date
    const registerDate = new Date();

    // Encrypts password using a hash function
    const hashedPassword = await bcrypt.hash(password, 10);

    // Save new user into the database
    const newUser = new User({ username, email, password: hashedPassword, registerDate, biography });
    await newUser.save();

    // Create empty collection for user
    const userCollection = new Collection({ username, collection: [] })
    await userCollection.save();

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
