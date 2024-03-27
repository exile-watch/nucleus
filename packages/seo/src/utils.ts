function titleCase(str) {
  if (!str) return;

  const lowerCaseWords = ["of"];
  return str
    .split("-") // Split the string into an array by dashes.
    .map((word, index) => {
      // Check if the word should remain in lowercase, except if it's the first word.
      if (lowerCaseWords.includes(word) && index !== 0) {
        return word;
      }
      // Capitalize the first letter of the word.
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(" ") // Join the array back into a string with spaces.
    .replace(/(\d+)/, " $1"); // Ensure numbers are correctly spaced.
}

export { titleCase };
