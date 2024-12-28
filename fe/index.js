const { Builder, By, until } = require("selenium-webdriver");
require("dotenv/config");

async function transformDataToObject(trendingElements) {
  try {
    // Create an array to store the triplets
    const processedData = [];

    // Process each trending topic element
    for (let i = 3; i < trendingElements.length; i += 3) {
      // Skip if we don't have a complete triplet
      if (i + 2 >= trendingElements.length) break;

      // Extract the text from each element
      const topic = await trendingElements[i].getText();
      const posts = await trendingElements[i + 1].getText();
      const category = await trendingElements[i + 2].getText();

      // Add the triplet to our processed data
      processedData.push(topic, posts, category);
    }

    console.log("Data being sent:", processedData);

    const response = await fetch("http://localhost:4000/trending", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(processedData),
    });

    if (response.ok) {
      const result = await response.json();
      console.log("Data sent successfully:", result);
    } else {
      const errorDetails = await response.json();
      console.error("Server error:", errorDetails);
    }
  } catch (error) {
    console.error("Error while processing or sending data:", error);
  }
}

async function getCredentials() {
  try {
    const response = await fetch("http://localhost:4000/getCredentials");
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching credentials:", error);
    throw error;
  }
}

export async function extractTwitterData() {
  let driver;
  try {
    const { email, username, password } = await getCredentials();

    // Input validation
    if (!email || !username || !password) {
      throw new Error("Missing required credentials");
    }

    driver = await new Builder().forBrowser("chrome").build();

    // Navigate to Twitter
    await driver.get("https://x.com/login");
    await driver.sleep(3000); // Initial load wait

    // Login process with better error handling
    const emailField = await driver.wait(
      until.elementLocated(By.css('input[name="text"]')),
      20000
    );
    await emailField.clear();
    await emailField.sendKeys(email);

    const nextButton = await driver.findElement(
      By.xpath('//span[text()="Next"]')
    );
    await nextButton.click();
    await driver.sleep(2000);

    const usernameField = await driver.wait(
      until.elementLocated(By.css('input[name="text"]')),
      10000
    );
    await usernameField.clear();
    await usernameField.sendKeys(username);

    const nextButtonUsername = await driver.findElement(
      By.xpath('//span[text()="Next"]')
    );
    await nextButtonUsername.click();
    await driver.sleep(2000);

    const passwordField = await driver.wait(
      until.elementLocated(By.css('input[name="password"]')),
      10000
    );
    await passwordField.clear();
    await passwordField.sendKeys(password);

    const submitButton = await driver.findElement(
      By.xpath('//span[text()="Log in"]')
    );
    await submitButton.click();

    // Wait for the trending section with timeout
    const trendingSection = await driver.wait(
      until.elementLocated(By.css('div[aria-label="Timeline: Trending now"]')),
      30000
    );

    // Wait for trending elements to be populated
    await driver.sleep(5000);

    // Get all trending elements including topic, posts count, and category
    const trendingElements = await trendingSection.findElements(
      By.css('div[dir="ltr"] > span')
    );

    if (trendingElements.length === 0) {
      throw new Error("No trending topics found");
    }

    // Process and send the data
    await transformDataToObject(trendingElements);
  } catch (error) {
    console.error("Error during extraction:", error);
    throw error;
  } finally {
    // Always close the browser
    if (driver) {
      await driver.quit();
    }
  }
}

// Execute the script
(async () => {
  try {
    await extractTwitterData();
  } catch (error) {
    console.error("Script execution failed:", error);
    process.exit(1);
  }
})();
