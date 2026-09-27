const fs = require('fs');
const path = require('path');
const { Collection } = require('discord.js');
const logger = require('../utils/logger');

function loadCommands() {
  const commands = new Collection();
  const commandsPath = path.join(__dirname, '..', 'commands');
  const categories = fs.readdirSync(commandsPath);

  for (const category of categories) {
    const categoryPath = path.join(commandsPath, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;

    const files = fs.readdirSync(categoryPath).filter((f) => f.endsWith('.js'));
    for (const file of files) {
      const filePath = path.join(categoryPath, file);
      const command = require(filePath);

      if (!command?.data || !command?.execute) {
        logger.warn(`Command "${file}" tidak valid (butuh "data" & "execute"), dilewati.`);
        continue;
      }

      commands.set(command.data.name, command);
    }
  }

  return commands;
}

module.exports = { loadCommands };
