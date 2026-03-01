export default function generateRandomString() {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const numbers = "0123456789";
  const special = "!@#$%^&*()_+[]{}|;:,.<>?";

  const allChars = upper + lower + numbers + special;

  // Ensure at least one of each required type
  let result = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    numbers[Math.floor(Math.random() * numbers.length)],
    special[Math.floor(Math.random() * special.length)]
  ];

  // Fill remaining characters up to 6
  while (result.length < 6) {
    result.push(allChars[Math.floor(Math.random() * allChars.length)]);
  }

  // Shuffle result to randomize positions
  result = result.sort(() => Math.random() - 0.5);

  return result.join("");
}

// Example
console.log(generateRandomString());