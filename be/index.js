import express from "express";
import fs from "fs";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv/config";
import TrendingTopic from "./db/db.js";

const app = express();
app.use(cors());

app.use(express.json());
const PORT = 4000;

mongoose
  .connect(process.env.SECRET)
  .then(console.log("added"))
  .catch((error) => console.log(error));

// Save credentials to file
app.post("/saveCredentials", (req, res) => {
  const credentials = req.body;
  fs.writeFileSync("credentials.json", JSON.stringify(credentials)); // Save data to file
  res.status(200).send("Data saved");
});

// Get credentials from file
app.get("/getCredentials", (req, res) => {
  fs.readFile("credentials.json", "utf-8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read credentials file" });
    }
    res.status(200).json(JSON.parse(data)); // Parse and send the credentials as JSON
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.post("/trending", async (req, res) => {
  try {
    const data = req.body;

    // Input validation
    if (!Array.isArray(data)) {
      return res.status(400).json({ 
        error: "Request body must be an array" 
      });
    }

    if (data.length === 0) {
      return res.status(400).json({ 
        error: "Array cannot be empty" 
      });
    }

    if (data.length % 3 !== 0) {
      return res.status(400).json({ 
        error: "Data must be in multiples of three" 
      });
    }

    // Create array to store all documents
    const trendingTopics = [];

    // Process data in triplets
    for (let i = 0; i < data.length; i += 3) {
      const topicObj = {
        topic: data[i],
        posts: data[i + 1],
        category: data[i + 2],
        createdAt: new Date()
      };

      // Validate required fields
      if (!topicObj.topic || !topicObj.posts || !topicObj.category) {
        return res.status(400).json({
          error: `Missing required fields in triplet starting at index ${i}`
        });
      }

      // Create new document instance
      trendingTopics.push(new TrendingTopic(topicObj));
    }

    // Use insertMany for better performance
    await TrendingTopic.insertMany(trendingTopics);

    res.status(201).json({
      message: "Trending topics successfully stored",
      count: trendingTopics.length
    });

  } catch (error) {
    console.error("Error saving trending topics:", error);
    
    // Send appropriate error message based on error type
    const errorMessage = error.name === 'ValidationError' 
      ? 'Invalid data format'
      : 'Failed to store data';
      
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});


app.get("/getData" , async (req,res)=>{

  try {
    const allData = await TrendingTopic.find({});
    res.json(allData);
  } catch (error) {
    res.json(error);
  }

})