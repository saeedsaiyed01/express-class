const express = require("express");
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json()); 

const dataFilePath = path.join(__dirname, 'data.json');

// Read data from file
function readData() {
    try {
        if (fs.existsSync(dataFilePath)) {
            const rawData = fs.readFileSync(dataFilePath, 'utf8');
            return JSON.parse(rawData); // Parse the JSON data
        }
        return { users: [] }; // If file doesn't exist, start with an empty array
    } catch (err) {
        console.error("Error reading data:", err);
        return { users: [] };
    }
}

// Write data to file
function writeData(data) {
    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2)); // Write pretty-printed JSON
    } catch (err) {
        console.error("Error writing data:", err);
    }
}

// Get user by ID function
function getUserById(id) {
    const data = readData(); // Read data from file
    return data.users.find(user => user.id === parseInt(id));
}

// Welcome message
app.get("/", (req, res) => {
    res.send("Welcome to the Kidney Health Server! Use /user/:id to get user data.");
});

// Get user's kidneys by user ID
app.get("/user/:id", (req, res) => {
    const user = getUserById(req.params.id);
    if (!user) {
        return res.status(404).json({ msg: "User not found" });
    }

    const kidneys = user.kidneys;
    const numberOfKidneys = kidneys.length;
    const numberOfHealthyKidneys = kidneys.filter(k => k.healthy).length;
    const numberOfUnhealthyKidneys = numberOfKidneys - numberOfHealthyKidneys;

    res.json({
        name: user.name,
        numberOfKidneys,
        numberOfHealthyKidneys,
        numberOfUnhealthyKidneys
    });
});


app.post("/user/:id/kidneys", (req, res) => {
    try {
        const data = readData(); 
        const user = getUserById(req.params.id);

        if (!user) {
            return res.status(404).json({ msg: "User not found" });
        }

        const isHealthy = req.body.isHealthy;
        user.kidneys.push({ healthy: isHealthy });

        
        data.users = data.users.map(u => u.id === user.id ? user : u);

        writeData(data); // Update the data file

        res.json({ msg: "Kidney added successfully!" });
    } catch (error) {
        res.status(500).json({ msg: "Internal server error", error: error.message });
    }
});

// Update all kidneys to healthy for a specific user
app.put("/user/:id/kidneys", (req, res) => {
    try {
        const data = readData(); 

        // Find the user by ID
        const userIndex = data.users.findIndex(user => user.id === parseInt(req.params.id));
        if (userIndex === -1) {
            return res.status(404).json({ msg: "User not found" });
        }

        data.users[userIndex].kidneys.forEach(kidney => kidney.healthy = true);
        writeData(data);
        res.json({ msg: "All kidneys updated to healthy!" });
    }
    
    catch (error) {
        console.error("Error updating kidneys:", error);
        res.status(500).json({ msg: "Internal server error", error: error.message });
    }
});


// Delete unhealthy kidneys for a specific user
app.delete("/user/:id/kidneys", (req, res) => {
    const data = readData(); 
    const user = getUserById(req.params.id);

    if (!user) {
        return res.status(404).json({ msg: "User not found" });
    }

    if (user.kidneys.some(k => !k.healthy)) {
        user.kidneys = user.kidneys.filter(k => k.healthy);
        writeData(data); 
        res.json({ msg: "Unhealthy kidneys removed!" });
    } else {
        res.status(411).json({ msg: "User has no unhealthy kidneys" });
    }
});

// Add a new user
app.post("/user", (req, res) => {
    const data = readData(); 
    const newUser = {
        id: data.users.length ? data.users[data.users.length - 1].id + 1 : 1,
        name: req.body.name,
        kidneys: []
    };
    data.users.push(newUser);//add new user
    writeData(data); 
    res.json({ msg: "User added successfully!", user: newUser });
});

// Delete a user
app.delete("/user/:id", (req, res) => {
    const data = readData();
    const userIndex = data.users.findIndex(user => user.id === parseInt(req.params.id));

    if (userIndex === -1) {
        return res.status(404).json({ msg: "User not found" });
    }

    data.users.splice(userIndex, 1); // Remove the user 
    writeData(data); // Update the data file
    res.json({ msg: "User deleted successfully!" });
});

// Start the server on port
app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
