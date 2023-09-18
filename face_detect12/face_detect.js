const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const startButton = document.getElementById("startButton");
const verifyButton = document.getElementById("verifyButton"); // Add this line
const messageElement = document.getElementById("message"); // Add this line for displaying messages
const verifiying = document.getElementById("verifiying");


let ctx;
let videoWidth, videoHeight;
let model; // Define the model variable
// let stopRendering = true; // Initialize the rendering flag
let capturing = false;
let capturedImageURL = "";

let landmarks = [];

// Check if CPU backend is available
const isCpuBackendAvailable = tf.getBackend() === 'cpu';


async function setupCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    video.srcObject = stream;
       
    return new Promise((resolve) => {
        video.onloadedmetadata = () => {
            videoWidth = video.videoWidth;
            videoHeight = video.videoHeight;
            video.width = videoWidth;
            video.height = videoHeight;
            resolve(video);
           
        };
    });
    
}

async function setupCanvas() {
    canvas.width = videoWidth;
    canvas.height = videoHeight;

    ctx = canvas.getContext('2d');
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);

    ctx.fillStyle = "green";
}



function hideStartButton() {

    $("#startButton").hide();
    $("#canvas").show();
    $("#imag2").show();
 
}
async function loadFaceLandmarkDetectionModel() {
    return faceLandmarksDetection
        .load(faceLandmarksDetection.SupportedPackages.mediapipeFacemesh,
            { maxFaces: 1 });
}

const CONFIDENCE_THRESHOLD = 0.99;
const PIN_POINTING = 0.99989;
const DETECTED = 1;


async function captureFrame() {
    ctx = canvas.getContext("2d");
    // canvas.width = width;
    // canvas.height = height;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageBlob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg"));
    console.log(imageBlob);
    return imageBlob;
}

async function renderPrediction() {
    // if (stopRendering) {
    //    return;
    // }

    const predictions = await model.estimateFaces({
        input: video,
        returnTensors: false,
        flipHorizontal: false,
        predictIrises: false
    });

    ctx.drawImage(
        video, 0, 0, video.width, video.height, 0, 0, canvas.width, canvas.height);

    if (predictions.length > 0) {
        $("#imag2").hide();
        predictions.forEach(prediction => {
            var faceInViewConfidence = prediction.faceInViewConfidence;
            if (faceInViewConfidence > PIN_POINTING) {
                const scaledMesh = prediction.scaledMesh;
                for (let i = 0; i < scaledMesh.length; i++) {
                    const x = scaledMesh[i][0];
                    const y = scaledMesh[i][1];
                    ctx.beginPath();
                    ctx.arc(x, y, 2, 0, 2 * Math.PI);
                    ctx.fill();
                    landmarks.push({ x, y });
                }
                console.log("Pinpointing face level" + faceInViewConfidence);
                setTimeout(() => {
                    // stopRendering = true;
                    // capturing = false;
                    // console.log("Face Captured.");
                    // window.location.href = "old_index.html";
                    // captureFrame(video.width, video.height);
                    
                    if (capturing) {
                        capturing = false;
                        console.log("Face Captured.");
                        
                        // captureFrame(video.width, video.height);
                        
                        saveCapturedImageToInput();
                        
                        // Redirect to a new page after capturing
                        alert("Face captured successfully. Click OK to continue.");
                        window.location.href = "registration.html"; // Change to your desired page URL
                    }
                    
                }, 3000);
            }
        });
    } else {
        console.log("No detection");
        capturing = false; // new
        
        // Display an alert message and restart the capturing process
        alert("No face detected. Please restart.");

        // Restart the capturing process
        capturing = true;
    }

    // if (!stopRendering) { // old
    if (capturing) {
        window.requestAnimationFrame(renderPrediction);
    }
}




// Add a loading screen
const loadingScreen = document.createElement("div");
// loadingScreen.innerText = "Loading...";
document.body.appendChild(loadingScreen);

async function preloadResources() {
    // Load TensorFlow.js models and other resources here
    await Promise.all([
        loadFaceLandmarkDetectionModel(),
        // Add other resource loading here
    ]);
    loadingScreen.style.display = "none"; // Hide loading screen
}


async function captureWithLandmarks() {
    ctx.drawImage(
        video, 0, 0, video.width, video.height, 0, 0, canvas.width, canvas.height);
    
    // You can capture the frame with landmarks and store it as an image
    const imageBlob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg"));
    console.log(imageBlob);
    
    // You can also access the landmarks array for further processing if needed
    console.log("Captured Landmarks:", landmarks);
}

// Function to save the captured image as an image URL
function saveCapturedImageToInput() {
    const canvas = document.getElementById('canvas');  // Use the ID of your canvas element
    const capturedImage = document.getElementById('capturedImage');  // Get the img element
    const imageURL = canvas.toDataURL('image/jpeg');
    
    // Set the src attribute of the img element to display the captured image
    capturedImage.src = imageURL;
    
    // Store the captured image URL in session storage
    sessionStorage.setItem('capturedImageURL', imageURL);
    
    // Replace 'your_input_id' with the actual ID of your input field
    document.getElementById('face_rec').value = imageURL;

    // Set the user_rec field with the desired meta key and id
    const metaKey = "face_rec"; 
    const id = 7; 
    const metaValue = JSON.stringify({ key: metaKey, id: id, image: imageURL });
    
    // Replace 'face_rec' with the actual ID of your input field for meta data
    document.getElementById('face_rec').value = metaValue;
    
    // Set the value of the input field to store the image URL
    // document.getElementById('imageURL').value = imageURL;
    
    // document.getElementById("face_rec").value = imageURL;
    
    // Set the user_rec field with the desired meta key
    // const metaKey = "face_rec";  // Replace 'your_meta_key' with your desired meta key
    // document.getElementById('face_rec').value = metaKey;
}



startButton.addEventListener("click", async () => {
	// Preload resources before starting the camera
    await preloadResources();
    
    // Set up camera
    hideStartButton();
    await setupCamera();

    // Set up canvas
    await setupCanvas();

    // Load the model
    model = await loadFaceLandmarkDetectionModel();
    
    capturing = true; // Start capturing immediately
    renderPrediction();   
    
    // call the function after capturing
    saveCapturedImageToInput();
});
