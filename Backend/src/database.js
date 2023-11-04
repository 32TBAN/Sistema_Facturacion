const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://estebanguanoluisa55:MI3deenero@cluster0.xun82if.mongodb.net/api-db?retryWrites=true&w=majority"
  )
  .then(console.log("se a conectado"))
  .catch((err) => console.log(err));