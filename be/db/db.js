import mongoose from "mongoose"

const trendingTopicSchema = new mongoose.Schema({
  topic: {
    type: String,
   
  },
  posts: {
    type: String,
   // Number of posts will be stored as a string (e.g., "24.9K posts")
  },
  category: {
    type: String,
    // Category like "Entertainment", "Trending in India"
  },
  date: {
    type: Date,
    default: Date.now, // Store the date when the trending topics were captured
  },
});

const TrendingTopic = mongoose.model("TrendingTopic", trendingTopicSchema);

export default TrendingTopic;
