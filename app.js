import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import client from "@mailchimp/mailchimp_marketing";

// Intialize express app
const app = express();

console.log(process.env.API_KEY, process.env.SERVER_LOC, process.env.LIST_ID);

// Set config for MailChimp API using env variables
client.setConfig({
  // variables set in Cyclic dashboard
  apiKey: process.env.API_KEY,
  server: process.env.SERVER_LOC,
});

// Create a static folder for relative paths when using images, css, and javascript
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

// Declare __filename and __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Newsletter Page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "signup.html"));
});

// Post request when submit button is clicked on Sign-Up Page
app.post("/", (req, res) => {
  var subscribingUser = req.body;

  // Data is collected into a javascript object and is passed addListMember()
  const data = {
    email_address: subscribingUser.email,
    status: "subscribed",
    email_type: "text",
    merge_fields: {
      FNAME: subscribingUser.firstName,
      LNAME: subscribingUser.lastName,
    },
  };

  const run = async () => {
    // Loop is used to determine success or failure
    try {
      const response = await client.lists.addListMember(
        process.env.LIST_ID,
        data
      );
      res.sendFile(path.join(__dirname, "success.html"));
    } catch (e) {
      console.log(response);
      res.sendFile(path.join(__dirname, "failure.html"));
    }
  };

  // Runs the function that adds the member to the mailing list
  run();
});

// Failure Page
app.post("/failure", (req, res) => {
  res.redirect("/");
});

// Start Up Server
app.listen(process.env.PORT || 3000, () => {
  console.log("Server has been started on port 3000.");
});
