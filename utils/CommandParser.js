export class CommandParser {
  static parse(text) {
    console.log("Text X"+text);
    const parts = text.trim().split(/\s+/);
    const command = parts[0];
    const options = {};

    for (let i = 1; i < parts.length; i++) {
      const part = parts[i];

      // -p:25.5
      if (part.includes(':')) {
        const [key, value] = part.split(':');
        options[key.replace('-', '')] = value;
        continue;
      }

      // -p 25.5
      if (part.startsWith('-')) {
        const key = part.replace('-', '');
        const value = parts[i + 1];

        if (value && !value.startsWith('-')) {
          options[key] = value;
          i++;
        } else {
          options[key] = true;
        }
      }
    }

    return { command, options };
  }
}