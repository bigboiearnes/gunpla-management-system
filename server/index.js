const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');

const Kit = require('./model/Kit');
const User = require ('./model/User')

const app = express();
const port = 4000;

// Connect to MongoDB
mongoose.connect('mongodb://connorearneybs3221:IwT3a5xY75iviD3407DWDJBUPzcMYZPyCK6rdkSvhPPKnnkNDdHKNh9aVVwScgnBz6Es4EfTr1pxACDbg8AbXw==@connorearneybs3221.mongo.cosmos.azure.com:10255/universitywork?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@connorearneybs3221@', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(error => console.error('Error connecting to MongoDB:', error));

app.use(bodyParser.json());

//Fetches kit using kitId
app.get('/api/kits/:kitId', async (req, res) =>{
  try {
    const kit = await Kit.findOne({ kitId: req.params.kitId });
    if (!kit) {
      return res.status(404).json({ error: 'Kit not found' });
    }
    res.json(kit);
  } catch (error) {
    console.error('Error occurred while fetching kit:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

//Registers the user
app.post('/api/register', async (req, res) =>{
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
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
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid username or password '});
    }
    res.json({ message: 'Login successful' });
  } catch (error) {
      console.error('Error occurred during login:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
