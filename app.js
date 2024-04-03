const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

const WINDOW_SIZE = 10;

let numbers = [];

const calculateAverage = (nums) => {
  const sum = nums.reduce((acc, num) => acc + num, 0);
  return sum / nums.length;
};

const fetchNumbers = async (qualifier) => {
  let apiUrl = "";
  switch (qualifier) {
    case "p":
      apiUrl = "http://20.244.56.144/test/primes";
      break;
    case "f":
      apiUrl = "http://20.244.56.144/test/fibo";
      break;
    case "e":
      apiUrl = "http://20.244.56.144/test/even";
      break;
    case "r":
      apiUrl = "http://20.244.56.144/test/rand";
      break;
    default:
      return [];
  }
  try {
    const response = await axios.get(apiUrl);
    return response.data.numbers;
  } catch (error) {
    console.error("Error fetching numbers:", error);
    return [];
  }
};

app.get("/numbers/:qualifier", async (req, res) => {
  const qualifier = req.params.qualifier.toLowerCase();

  const fetchedNumbers = await fetchNumbers(qualifier);

  if (fetchedNumbers.length === 0) {
    res.status(500).send("Error fetching numbers from the test server");
    return;
  }

  numbers = [...new Set([...numbers, ...fetchedNumbers])];

  if (numbers.length > WINDOW_SIZE) {
    numbers = numbers.slice(-WINDOW_SIZE);
  }

  const avg = calculateAverage(numbers);

  const response = {
    numbers: fetchedNumbers,
    windowPrevState: numbers.slice(0, -fetchedNumbers.length),
    windowCurrState: numbers,
    avg: avg.toFixed(2),
  };

  res.json(response);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
