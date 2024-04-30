const express = require('express');
const mongoose = require('mongoose');
const Kit = require('./model/Kit')

const app = express();
const port = 4000;

// Connect to MongoDB
mongoose.connect('mongodb://connorearneybs3221:IwT3a5xY75iviD3407DWDJBUPzcMYZPyCK6rdkSvhPPKnnkNDdHKNh9aVVwScgnBz6Es4EfTr1pxACDbg8AbXw==@connorearneybs3221.mongo.cosmos.azure.com:10255/universitywork?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@connorearneybs3221@', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(error => console.error('Error connecting to MongoDB:', error));


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


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});



