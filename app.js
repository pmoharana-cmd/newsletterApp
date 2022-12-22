import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import client from "@mailchimp/mailchimp_marketing";

const app = express();
client.setConfig({
  apiKey: process.env.API_KEY,
  server: process.env.SERVER_LOC,
});

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Newsletter Page

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "signup.html"));
});

app.post("/", (req, res) => {
  var subscribingUser = req.body;

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
    try {
      const response = await client.lists.addListMember(
        process.env.LIST_ID,
        data
      );
      res.sendFile(path.join(__dirname, "success.html"));
    } catch (e) {
      res.sendFile(path.join(__dirname, "failure.html"));
    }
  };

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
