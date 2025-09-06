const escapeMarkdownV2 = (text) => {
  if (typeof text !== 'string') {
    return text;
  }
  const charsToEscape = [
    '_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'
  ];
  let escapedText = text;
  for (const char of charsToEscape) {
    escapedText = escapedText.split(char).join(`\\${char}`);
  }
  return escapedText;
};

module.exports = {
  escapeMarkdownV2
};
