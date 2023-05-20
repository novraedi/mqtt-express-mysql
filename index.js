const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const mqtt = require("mqtt");
const cors = require("cors");

const app = express();
app.use(cors());
// Parse JSON bodies
app.use(bodyParser.json());

// Parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: true }));
// Create a database connection
const connection = mysql.createConnection({
  host: "database-1.cifocsqnybtn.ap-southeast-1.rds.amazonaws.com",
  database: "sensor",
  user: "admin",
  password: "skomda2023",
});

// Create a new MQTT client instance
const client = mqtt.connect("mqtt://18.139.224.47:1883", {
  username: "novra",
  password: "123",
});

// Connect the MQTT client to the broker
client.on("connect", () => {
  console.log("Connected to MQTT broker");
});

// Array untuk menyimpan data sensor
let suhuData = [];
// Connect to the database
connection.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Connected to database");
  }
});
// Subscribe to the topic that you want to receive data from
client.subscribe("test/iot");

// Create a route that will handle the incoming messages
client.on("message", (topic, payload) => {
  const sql = `INSERT INTO sensor (topic, payload) VALUES (?, ?)`;
  const values = [topic, payload];
  const suhu = payload.toString();
  connection.query(sql, values, (error, results, fields) => {
    if (error) {
      console.error("Error inserting a new row: " + error.stack);
      res.status(500).send("Error inserting a new row");
      return;
    }
    suhuData.push(suhu);
    console.log("New row created successfully");
  });
});

app.get("/suhu", (req, res) => {
  res.json({ suhu: suhuData });
});

// Start the server
app.listen(3000, () => {
  console.log("Server started on port 3000");
});
