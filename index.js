const express = require("express");
const fs = require('fs');
const path = require('path');
const app = express();

app.use(express.json()); 

const dataFilePath = path.join(__dirname, 'data.json');

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Send index.html for the root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Read data from file
function readData() {
    try {
        if (fs.existsSync(dataFilePath)) {
            const rawData = fs.readFileSync(dataFilePath, 'utf8');
            return JSON.parse(rawData); 
        }
        return { users: [] }; 
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
    const data = readData(); 
    return data.users.find(user => user.id === parseInt(id));
}

// Welcome message
app.get("/", (req, res) => {
    res.send("Welcome to the Kidney Health Server! Use /user/:id to get user data.");
});


app.get("/user/:id", (req, res) => {
    const user = getUserById(req.params.id);
    if (!user) {
        return res.status(404).json({ msg });
    }

    const kidneys = user.kidneys;
    const numberOfKidneys = kidneys.length;
    const numberOfHealthyKidneys = kidneys.filter(k => k.healthy).length;
    const numberOfUnhealthyKidneys = numberOfKidneys - numberOfHealthyKidneys;

    res.json({
        name: user.name,
        numberOfKidneys,
        numberOfHealthyKidneys,
        numberOfUnhealthyKidneys,
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

        writeData(data); 

        res.json({ msg: "Kidney added successfully!" });
    } catch (error) {
        res.status(500).json({ msg: "Internal server error", error: error.message });
    }
});

// Delete unhealthy kidneys of user

app.delete("/user/:id/kidneys", (req, res) => {
    const userId = parseInt(req.params.id); 
    const data = readData(); 
    const user = getUserById(userId); 

    console.log('Request for user ID:', userId);
    console.log('User found:', user);

    if (!user) {
        return res.status(404).json({ msg: "User not found" });
    }

   
    const unhealthyKidneys = user.kidneys.filter(kidney => !kidney.healthy);

    if (unhealthyKidneys.length === 0) {
        return res.status(400).json({ msg: "No unhealthy kidneys found" });
    }

    
    user.kidneys = user.kidneys.filter(kidney => kidney.healthy);

   
    data.users = data.users.map(u => u.id === userId ? user : u);
    writeData(data); 

    res.json({ msg: "Unhealthy kidneys removed" });
});


// Add a new user
app.post("/user", (req, res) => {
    const data = readData(); 
    const newUser = {
        id: data.users.length ? data.users[data.users.length - 1].id + 1 : 1,
        name: req.body.name,
        kidneys: []
    };
    data.users.push(newUser);
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

    data.users.splice(userIndex, 1); 
    writeData(data); 
    res.json({ msg: "User deleted successfully!" });
});

app.listen(3000, () => {
    console.log("Server is running on port 3000");
});
