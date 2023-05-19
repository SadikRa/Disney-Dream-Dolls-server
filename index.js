const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");


app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.BD_PASS}@cluster0.ywq3nhp.mongodb.net/?retryWrites=true&w=majority`;

console.log(uri);
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const toyStoreCollection = client.db("toyStore").collection("store");

    const indexKeys = { toyName: 1, subCategory: 1 };
    const indexOptions = { name: "sellerSubCategory" };

    const result = await toyStoreCollection.createIndex(
      indexKeys,
      indexOptions
    );

    app.get("/getSearchToy/:text", async (req, res) => {
      const text = req.params.text;
      const result = await toyStoreCollection
        .find({
          $or: [
            { toyName: { $regex: text, $options: "i" } },
            { subCategory: { $regex: text, $options: "i" } },
          ],
        })
        .toArray();
      res.send(result);
    });


    app.get('/toyStores/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toyStoreCollection.findOne(query);
      res.send(result);
  })


    app.get("/toyStores", async (req, res) => {
      const result = await toyStoreCollection
        .find()
        .limit(20)
        .sort({ createdAt: 1 })
        .toArray();
      res.send(result);
    });

    app.post("/toyStores", async (req, res) => {
      const body = req.body;
      const result = await toyStoreCollection.insertOne(body);
      res.send(result);
    });

    app.delete('/toyStores/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await toyStoreCollection.deleteOne(query);
      res.send(result);
  })

    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("toy server is running");
});

app.listen(port, () => {
  console.log(`toy server is running on: ${port}`);
});
