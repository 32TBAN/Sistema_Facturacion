const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://"
  )
  .then(console.log("se a conectado"))
  .catch((err) => console.log(err));
