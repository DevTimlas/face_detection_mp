// Retrieve the captured image URL from session storage
const capturedImageURL = sessionStorage.getItem('capturedImageURL');
document.getElementById("capturedImage").src = capturedImageURL;
document.getElementById('face_rec').value = capturedImageURL;

// Event listener for the registration form submission
document.getElementById("registrationForm").addEventListener("submit", async (e) => {
    e.preventDefault(); // Prevent the default form submission
    
    // Get user input values
    const username = document.getElementById("username").value;
    const firstName = document.getElementById("firstName").value;
    const lastName = document.getElementById("lastName").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const faceImageURL = capturedImageURL; // Captured image URL
    
    // Create a FormData object to send data to the server
    const formData = new FormData();
    formData.append("username", username);
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("email", email);
    formData.append("password", password);
    formData.append("faceImageURL", faceImageURL);
    
    // Send the form data to the server using fetch or another AJAX method
    // Replace 'backend_registration_url' with the actual URL to your backend registration endpoint
    try {
        const response = await fetch('backend_registration_url', {
            method: 'POST',
            body: formData,
        });
        
        if (response.ok) {
            // Registration successful, you can redirect the user or display a success message
            alert("Registration successful!");
            window.location.href = "login.html"; // Redirect to login page
        } else {
            // Handle registration failure (e.g., display an error message)
            alert("Registration failed. Please try again.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("An error occurred. Please try again later.");
    }
});
