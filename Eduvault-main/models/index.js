const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const models = {};
const files = fs.readdirSync(__dirname);



// Auto-import everything except index.js
files.forEach(file => {
  if (file !== "index.js" && file.endsWith(".js")) {
    const model = require(path.join(__dirname, file));
    models[model.modelName] = model;
  }
});

module.exports = models;
