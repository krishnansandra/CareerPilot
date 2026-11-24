
const genAI = require("../config/gemini");

const generateAIResponse = async (prompt) => {
  try {
    console.log("Sending request to Gemini...");

    const response = await genAI.interactions.create({
      model: "gemini-3.1-flash-lite",
      input: prompt,
    });

    console.log("Gemini response received!");

    return response.output_text;
  } catch (error) {
    console.error("Gemini API Error:", error.message);
    throw new Error("Unable to generate AI response.");
  }
};

module.exports = { generateAIResponse };
