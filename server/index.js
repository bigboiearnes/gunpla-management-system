// const express = require('express');
// const bodyParser = require('body-parser');
// const cors = require('cors');
const mongoose = require('mongoose');
const Kit = require('./model/Kit')

// const app = express();
// const port = 3001;

// app.use(bodyParser.json());
// app.use(cors());

// Connect to MongoDB
mongoose.connect('mongodb://connorearneybs3221:IwT3a5xY75iviD3407DWDJBUPzcMYZPyCK6rdkSvhPPKnnkNDdHKNh9aVVwScgnBz6Es4EfTr1pxACDbg8AbXw==@connorearneybs3221.mongo.cosmos.azure.com:10255/universitywork?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@connorearneybs3221@', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(error => console.error('Error connecting to MongoDB:', error));

// // Route handler to insert a document into the 'waqqly' collection
// app.post('/submitForm', async (req, res) => {
//   const { formType, name, dogName } = req.body;

//   try {
//     if (formType === 'walker') {
//       await mongoose.connection.collection('waqqly').insertOne({ formType, name });
//     } else if (formType === 'owner') {
//       await mongoose.connection.collection('waqqly').insertOne({ formType, name, dogName })
//     } else {
//         throw new Error('Invalid form type', formType);
//       }
//     console.log('Document inserted successfully:', { name });
//     res.status(201).send('Document inserted successfully');
//   } catch (error) {
//    console.error('Error inserting document:', error);
//    res.status(500).send('Internal Server Error');
//   }
// });

// // Start the server
// app.listen(port, () => {
//   console.log(`Server is running on port ${port}`);
// });

Kit.find({}).then(kits => {
    if (kits.length === 0) {
      console.log('No kits found.');
    } else {
      console.log('Kits found:');
      kits.forEach(kit => {
        console.log(kit.kitName);
      });
    }
  }).catch(err => {
    console.error('Error occurred while fetching kits:', err);
  });


