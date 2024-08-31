


document.getElementById('theme-toggle').addEventListener('click', function() {
    // Toggle dark mode on body

    document.body.classList.toggle('dark-mode');
    document.body.classList.toggle('light-mode');
    
    
    // Toggle the button icon
    this.textContent = document.body.classList.contains('dark-mode') ? '🌙' : '🌙';
});


document.getElementById('addUserName').addEventListener('input', function() {
    this.value = this.value.replace(/[^a-zA-Z]/g, '');
});





let currentUserId = null;  // Variable to store the current user's ID

function addUser() {
    const userName = document.getElementById('addUserName').value;

    if (!userName) {
        displayMessage('Please enter a user name.');
        return;
    }

    fetch('/user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name: userName })
    })
    .then(response => response.json())
    .then(data => {
        displayMessage(data.msg);
        currentUserId = data.user.id;  
        getUserDetails(currentUserId); 
    })
    .catch(error => {
        console.error('Error adding user:', error);
        displayMessage('Failed to add user.');
    });
}

function addKidney() {
    if (!currentUserId) {
        displayMessage('No user selected. Please add a user first.');
        return;
    }

    fetch(`/user/${currentUserId}/kidneys`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isHealthy: true })  
    })
    .then(response => response.json())
    .then(data => {
        displayMessage(data.msg);
        getUserDetails(currentUserId); 
    })
    .catch(error => {
        console.error('Error adding kidney:', error);
        displayMessage('Failed to add kidney.');
    });
}


function addUnhealthyKidney() {
    if (!currentUserId) {
        displayMessage('No user selected. Please add a user first.');
        return;
    }

    fetch(`/user/${currentUserId}/kidneys`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isHealthy: false })  // Assuming kidney is healthy by default
    })
    .then(response => response.json())
    .then(data => {
        displayMessage(data.msg);
        getUserDetails(currentUserId);  
    })
    .catch(error => {
        console.error('Error adding kidney:', error);
        displayMessage('Failed to add kidney.');
    });
}

function removeUnhealthyKidney() {
    if (!currentUserId) {
        displayMessage('No user selected. Please add a user first.');
        return;
    }

    fetch(`/user/${currentUserId}/kidneys`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(response => {
        if (!response.ok) {
            if (response.status === 404) {
                throw new Error('User not found.');
            } else if (response.status === 411) {
                throw new Error('User has no unhealthy kidneys.');
            } else {
                throw new Error('Network response was not ok.');
            }
        }
        return response.json();
    })
    .then(data => {
        displayMessage(data.msg);
   
        getUserDetails(currentUserId);
    })
    .catch(error => {
        console.error('Error removing kidney:', error);
        displayMessage(error.message || 'Failed to remove kidney.');
    });
}



function removeUser() {
    if (!currentUserId) {
        displayMessage('No user selected. Please add a user first.');
        console.log('Current User ID is not set.');
        return;
    }

    console.log(`Removing user with ID: ${currentUserId}`);

    fetch(`/user/${currentUserId}`, { 
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
       
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        displayMessage(data.msg);
        currentUserId = null;  
        getUserDetails(null); 
    })
    .catch(error => {
        console.error('Error removing user:', error);
        displayMessage('Failed to delete user.');
    });
}











function displayMessage(message) {
    document.getElementById('output').innerText = message;
}

function getUserDetails(userId) {
    fetch(`/user/${userId}`)
    .then(response => response.json())
    .then(user => {
        if (user.msg) {
            displayMessage(user.msg);
        } else {
            document.getElementById('output').innerHTML = `
                <p>Name: ${user.name}</p>
                <p>Number of Kidneys: ${user.numberOfKidneys}</p>
                <p>Healthy Kidneys: ${user.numberOfHealthyKidneys}</p>
                <p>Unhealthy Kidneys: ${user.numberOfUnhealthyKidneys}</p>
            `;
        }
    })
    .catch(error => {
        console.error('', error)
    });
}
