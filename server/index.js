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
const Friendship = require('./model/Friendship')

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
  const { query, page, pageSize, kitGrade } = req.query;
  const pageNumber = parseInt(page, 10) || 1;
  const size = parseInt(pageSize, 10) || 10;

  try {
      // Calculate the number of documents to skip based on the page number and page size
      const skip = (pageNumber - 1) * size;

      let queryObj;

      // Search by kitId first
      if (/^[A-Z]+[0-9A-Z]*$/.test(query)) {
          // If the query is a valid kitId, search by kitId
          queryObj = { kitId: {$regex: query} };
      } else {
          // If the query is not a valid kitId, search by kitName, gundamModel, and kitGrade
          queryObj = {
              $or: [
                  { kitName: { $regex: query, $options: 'i' } },
                  { gundamModel: { $regex: query, $options: 'i' } }
              ]
          };

          // If kitGrade is provided, add it to the query object
          if (kitGrade) {
              queryObj.kitGrade = kitGrade;
          }
      }

      // Search kits
      const kits = await Kit.find(queryObj)
          .skip(skip)
          .limit(size);

      res.json(kits);
  } catch (error) {
      console.error('Error searching for kits:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// API route to fetch related kits based on gundamModel
app.get('/api/kits/related', async (req, res) => {
  const { gundamModel } = req.query;

  try {
    // Find all kits with a gundamModel exactly matching the provided value (case-insensitive)
    const relatedKits = await Kit.find({ gundamModel: { $regex: `^${gundamModel}$`, $options: 'i' } });

    res.json(relatedKits);
  } catch (error) {
    console.error('Error fetching related kits:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST route to add a tag to a kit
app.post('/api/kits/tag/add', authenticateToken, async (req, res) => {
  const { kitId, tag } = req.body;
  
  // Extract username from the request's decoded token
  const username = req.user.username;

  try {
    let kit = await Kit.findOne({ kitId });
    if (!kit) {
      return res.status(404).json({ error: 'Kit not found' });
    }

    // If userTags array doesn't exist, create it
    kit.userTags ??= [];

    // Count how many times the user's username appears in userTags array
    const userTagCount = kit.userTags.filter(t => t.username === username).length;

    // If user's username appears five times, find and remove the first occurrence
    if (userTagCount >= 5) {
      const firstUserTagIndex = kit.userTags.findIndex(t => t.username === username);
      kit.userTags.splice(firstUserTagIndex, 1);
    }

    // Check if the user has submitted more than 5 tags
    if (kit.userTags.length >= 5) {
      // Remove the first tag
      kit.userTags.shift();
    }

    // Add the new tag along with the username
    kit.userTags.push({ tag, username });

    await kit.save();

    res.status(200).json({ message: 'Tag added successfully'});
  } catch (error) {
    console.error('Error adding tag to kit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Get top ten kits by a tag
app.get('/api/kits/top-by-tag/:tag', async (req, res) => {
  const { tag } = req.params;

  try {
    // Query the database to find the top 10 kits with the specified tag
    const topKits = await Kit.find({ 'userTags.tag': tag })
                             .sort({ 'userTags.length': -1 })
                             .limit(10);

    res.json(topKits);
  } catch (error) {
    console.error('Error fetching top kits by tag:', error);
    res.status(500).json({ message: 'Internal server error' });
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

// Fetch most recently released kits for the current year and previous year if needed
app.get('/api/kits/get/recently-released', async (req, res) => {
  try {
    // Get the current year
    const currentYear = new Date().getFullYear();

    // Retrieve the 10 most recently released kits for the current year
    const currentYearKits = await Kit.find({ releaseYear: currentYear })
      .sort({ releaseMonth: -1 }) // Sort by releaseMonth in descending order (12-1)
      .limit(10);

    // Check if we have less than 10 kits for the current year
    const currentYearKitCount = currentYearKits.length;
    if (currentYearKitCount < 10) {
      // Calculate how many kits we need to fetch from the previous year
      const remainingKitsCount = 10 - currentYearKitCount;

      // Retrieve additional kits from the previous year to complete the list
      const previousYear = currentYear - 1;
      const previousYearKits = await Kit.find({ releaseYear: previousYear })
        .sort({ releaseMonth: -1 }) // Sort by releaseMonth in descending order (12-1)
        .limit(remainingKitsCount);

      // Combine the kits from both years
      const allKits = [...currentYearKits, ...previousYearKits];

      res.json(allKits);
    } else {
      res.json(currentYearKits);
    }
  } catch (error) {
    console.error('Error fetching recently released kits:', error);
    res.status(500).json({ message: 'Internal server error' });
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

app.post('/api/user/profile-picture', async (req, res) => {
  const { username, profilePicture } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update the user's profile picture
    user.profilePicture = profilePicture;

    // Save the updated user object
    await user.save();

    res.json({ message: 'Profile picture updated successfully' });
  } catch (error) {
    console.error('Error updating profile picture:', error);
    res.status(500).json({ message: 'Internal server error' });
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

app.post('/api/user/collection/add-image', authenticateToken, async (req, res) =>{
  const { kitId, imageUrl } = req.body;
  const username = req.user.username;
  const uploadDate = new Date();
  try {
    const collection = await Collection.findOneAndUpdate(
      { username, 'collection.kitId': kitId },
      { $set: { 'collection.$.image': imageUrl, 'collection.$.uploadDate': uploadDate } },
      { new: true }
    );

    if (!collection) {
      return res.status(404).json({ message: 'Collection item not found'});

    }

    res.json(collection);
  } catch (error) {
    console.error('Error adding image:', error);
    res.status(500).json({ message: 'Internal server error' });
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
app.get('/api/user/collection/fetch/:username', async (req, res) => {
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
app.get('/api/user/fetch/:username', async (req, res) =>{
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

// Create a friend request between users
app.post('/api/friends/request', authenticateToken, async (req, res) => {
  const { sender, receiver } = req.body;
  if (sender === req.user.username) {
    try {
      // Check if an existing (non-rejected) or pending relationship exists
      const existingFriendship = await Friendship.findOne({
        $or: [
          { sender: sender, receiver: receiver, status: { $ne: 'rejected' } },
          { receiver: sender, sender: receiver, status: { $ne: 'rejected' } }
        ]
      });
  
      if (existingFriendship) {
        return res.status(400).json({ error: 'User relationship already exists'});
      }
  
      // Create a new pending friendship
      const newFriendship = new Friendship({
        sender: sender,
        receiver: receiver,
        status: 'pending'
      });
  
      await newFriendship.save();
  
      res.status(201).json({ message: 'Friend request sent successfully' });
    } catch (error) {
      console.error('Error sending friend request:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }


});

// Check if users are friends
app.post('/api/friends/users', async (req, res) => {
  const { sender, receiver } = req.body;
  try {
    // Check if an existing (non-rejected) or pending relationship exists
    const existingFriendship = await Friendship.findOne({
      $or: [
        { sender: sender, receiver: receiver, status: 'pending'},
        { receiver: sender, sender: receiver, status: 'pending'},
      ]
    });
    if (existingFriendship) {
      return res.status(200).json({ message: 'User relationship already exists'});
    }
    return res.status(200).json({message: 'No user relationship'});
  } catch (error) {
    console.error('Error checking friendship:', error);
    res.status(500).json({ error: 'Internal server error'});
  }
});

// Fetch users friends
app.get('/api/friends/fetch/:username', async (req, res) => {
  const { username } = req.params;
  try {
    // Find friendships where the user is the source or target
    const friendships = await Friendship.find({
      $or: [{ sender: username }, { receiver: username }],
      status: 'accepted',
    });
    // Extract usernames of friends
    const friends = friendships.map(friendship => {
      return friendship.sender === username
        ? friendship.receiver
        : friendship.sender;
    });
    res.json(friends);
  } catch (error) {
    console.error('Error fetching user\'s friends:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
})

// Fetch users friend requests
app.get('/api/friends/requests/:username', async (req, res) => {
  const { username } = req.params;
  try {
    // Find pending friendships where the user target
    const pendingFriendshipRequests = await Friendship.find({
      receiver: username,
      status: 'pending'
    });

    res.json(pendingFriendshipRequests);
  } catch (error) {
    console.error('Error fetching user\'s friends:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
})

// Fetch friends most recent uploads
app.get('/api/friends/recent-uploads', authenticateToken, async (req, res) => {
  const currentUser = req.user.username;

  try {
      // Retrieve users friends
      const friends = await Friendship.find({
          $or: [{ sender: currentUser}, { receiver: currentUser}],
          status: 'accepted'
      });

      // Retreive recent uploads for each friend
      const recentUploads = [];
      for (const friend of friends) {
          let friendUsername;
          if (friend.sender === currentUser) {
              friendUsername = friend.receiver;
          } else {
              friendUsername = friend.sender;
          }

          const friendCollection = await Collection.findOne({ username: friendUsername })
              .sort({ 'collection.uploadDate': -1})
              .limit(10);

          if (friendCollection) {
              const uploads = friendCollection.collection.map(upload => ({
                  ...upload.toObject(),
                  username: friendUsername // Include the username associated with the collection image
              }));
              recentUploads.push(...uploads);
          }
      }

      // Sort and return the recent uploads
      recentUploads.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
      res.json(recentUploads.slice(0, 10));
  } catch (error) {
      console.error('Error fetching recent uploads for friends:', error);
      res.status(500).json({ message: 'Internal server error' });
  } 
});


// Accept friend request
app.post('/api/friends/accept', authenticateToken, async (req, res) => {
  const { sender, receiver } = req.body;
  if (receiver === req.user.username) {
  try {
    // Update the friendship status to 'accepted'
    const result = await Friendship.findOneAndUpdate(
      { sender: sender, receiver: receiver },
      { $set: { status: 'accepted' } }
    );

    if (result.nModified > 0) {
      res.status(200).json({ message: 'Friend request accepted successfully' });
    } else {
      res.status(404).json({ error: 'Friend request not found' });
    }
  } catch (error) {
    console.error('Error accepting friend request:', error);
    res.status(500).json({ error: 'Internal server error' });
  } 
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// Reject friend request
app.post('/api/friends/reject', authenticateToken, async (req, res) => {
  const { sender, receiver } = req.body;
  if (receiver === req.user.username) {
    try {
      // Remove the friendship entry
      const denyRequest = await Friendship.findOneAndDelete({
        $or: [
          { sender: sender, receiver: receiver},
          { receiver: sender, sender: receiver},
        ]
      });
      if (!denyRequest) {
        // No document found, return an appropriate response
        return res.status(404).json({ error: 'Friend request not found' });
      }
      // Successfully removed the friend request
      res.status(200).json({ message: 'Friend request rejected successfully' });
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// Delete friend 
app.post('/api/friends/delete', authenticateToken, async (req, res) => {
  const { sender, receiver } = req.body;
  if (sender === req.user.username) {  
    try {
      // Remove the friendship entry
      const denyRequest = await Friendship.findOneAndDelete({
        $or: [
          { sender: sender, receiver: receiver,},
          { receiver: sender, sender: receiver,},
        ]
      });
      if (!denyRequest) {
        // No document found, return an appropriate response
        return res.status(404).json({ error: 'Friend request not found' });
      }
      // Successfully removed the friend request
      res.status(200).json({ message: 'Friend request rejected successfully' });
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
