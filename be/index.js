import express from "express";
import fs from "fs";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv/config";
import TrendingTopic from "./db/db.js";
import { Builder, By, until } from "selenium-webdriver";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 4000;

// Connect to MongoDB
mongoose
  .connect(process.env.SECRET, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Database connected successfully"))
  .catch((error) => console.error("Database connection error:", error));

// Save credentials to file
app.post("/saveCredentials", (req, res) => {
  try {
    const credentials = req.body;

    if (!credentials.email || !credentials.username || !credentials.password) {
      return res.status(400).json({ error: "Incomplete credentials provided" });
    }

    fs.writeFileSync("credentials.json", JSON.stringify(credentials));
    res.status(200).send("Credentials saved successfully");
  } catch (error) {
    console.error("Error saving credentials:", error);
    res.status(500).json({ error: "Failed to save credentials" });
  }
});

// Get credentials from file
app.get("/getCredentials", (req, res) => {
  try {
    const data = fs.readFileSync("credentials.json", "utf-8");
    res.status(200).json(JSON.parse(data));
  } catch (error) {
    console.error("Error reading credentials:", error);
    res.status(500).json({ error: "Failed to read credentials" });
  }
});

// Extract Twitter Data
app.get("/extractTwitterData", async (req, res) => {
  let driver;
  try {
    // Load credentials from file
    const credentials = JSON.parse(fs.readFileSync("credentials.json", "utf-8"));
    const { email, username, password } = credentials;

    if (!email || !username || !password) {
      return res.status(400).json({ error: "Missing required credentials" });
    }

    driver = await new Builder().forBrowser("chrome").build();

    // Navigate to Twitter
    await driver.get("https://x.com/login");
    await driver.sleep(3000);

    // Login process with conditional username handling
    const emailField = await driver.wait(
      until.elementLocated(By.css('input[name="text"]')),
      20000
    );
    await emailField.clear();
    await emailField.sendKeys(email);

    const nextButton = await driver.findElement(By.xpath('//span[text()="Next"]'));
    await nextButton.click();
    await driver.sleep(2000);

    try {
      const usernameField = await driver.wait(
        until.elementLocated(By.css('input[name="text"]')),
        5000
      );
      await usernameField.clear();
      await usernameField.sendKeys(username);

      const nextButtonUsername = await driver.findElement(By.xpath('//span[text()="Next"]'));
      await nextButtonUsername.click();
      await driver.sleep(2000);
    } catch (error) {
      console.log("Username step skipped. Proceeding to password...");
    }

    const passwordField = await driver.wait(
      until.elementLocated(By.css('input[name="password"]')),
      10000
    );
    await passwordField.clear();
    await passwordField.sendKeys(password);

    const submitButton = await driver.findElement(By.xpath('//span[text()="Log in"]'));
    await submitButton.click();

    // Wait for the trending section and ensure it's loaded
    const trendingSection = await driver.wait(
      until.elementLocated(By.css('div[aria-label="Timeline: Trending now"]')),
      30000
    );
    await driver.sleep(5000);

    // Get all trend items
    const trendItems = await trendingSection.findElements(
      By.css('div[data-testid="trend"]')
    );

    // Process data with proper validation
    const processedData = [];
    
    for (const item of trendItems) {
      try {
        // Extract each piece of data with explicit error handling
        const topicElement = await item.findElement(By.css('div[dir="ltr"] > span'));
        const postsElement = await item.findElement(By.css('span > span'));
        const categoryElement = await item.findElement(By.css('span:last-child'));

        const topic = await topicElement.getText();
        const posts = await postsElement.getText();
        const category = await categoryElement.getText();

        // Only add if all fields are present and valid
        if (topic && posts && category) {
          processedData.push({
            topic: topic.trim(),
            posts: posts.trim(),
            category: category.trim()
          });
        }
      } catch (error) {
        console.warn("Skipping malformed trending topic item:", error.message);
        continue;
      }
    }

    // Validate processed data before saving
    if (processedData.length === 0) {
      throw new Error("No valid trending topics found");
    }

    console.log("Extracted Data:", processedData);

    // Save trending data to MongoDB
    await saveTrendingTopics(processedData);

    res.status(200).json(processedData);
  } catch (error) {
    console.error("Error during extraction:", error);
    res.status(500).json({ error: "Error during extraction: " + error.message });
  } finally {
    if (driver) {
      await driver.quit();
    }
  }
});

// Save trending topics with improved validation
const saveTrendingTopics = async (data) => {
  try {
    if (!Array.isArray(data)) {
      throw new Error("Data must be an array");
    }

    if (data.length === 0) {
      throw new Error("Data array is empty");
    }

    const trendingTopics = data.map(({ topic, posts, category }) => {
      if (!topic || !posts || !category) {
        throw new Error("Missing required fields in trending topic");
      }
      
      return new TrendingTopic({
        topic,
        posts,
        category,
        createdAt: new Date()
      });
    });

    const savedTopics = await TrendingTopic.insertMany(trendingTopics);
    console.log("Trending topics successfully stored:", savedTopics.length);
    
    return savedTopics;
  } catch (error) {
    console.error("Error saving trending topics:", error);
    throw error; // Re-throw to handle in the calling function
  }
};

// Fetch stored trending topics
app.get("/getData", async (req, res) => {
  try {
    const allData = await TrendingTopic.find({}).sort({ createdAt: -1 });
    res.status(200).json(allData);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch data" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
