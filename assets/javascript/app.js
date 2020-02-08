

//========== INITIALIZE FIREBASE =========
// --- web app's firebase configuration
var config = {
    apiKey: "AIzaSyAYgmHkiB6SB8bMij9DVExE5orB8n4JHh0",
    authDomain: "train-scheduler-bfa49.firebaseapp.com",
    databaseURL: "https://train-scheduler-bfa49.firebaseio.com",
    projectId: "train-scheduler-bfa49",
    storageBucket: "train-scheduler-bfa49.appspot.com",
    messagingSenderId: "208140903946",
    appId: "1:208140903946:web:cecbb597ef1952a87de1f3"
};

firebase.initializeApp(config);

// --- reference to firebase database (for convenience)
var database = firebase.database();

// ============= INITIAL VALUES: ==============
var name = "";
var destination = "";
var frequency = 0;            //in minutes
var firstTrain = 0;           //HH:mm

console.log(name, destination, frequency, firstTrain);

// ======== FUNCTION: ON,CLICK ADD TRAIN =======
// ==============================================
$("button").on("click", function (event) {

    event.preventDefault();

    name = $("#train-name-input").val().trim();
    destination = $("#destination-input").val().trim();
    frequency = parseInt($("#frequency-input").val().trim());
    firstTrain = $("#first-train-input").val().trim();

    // --- check click function works;
    console.log(name);
    console.log(destination);
    console.log(frequency);
    console.log(firstTrain);

    // ========= SET/PUSH data to database =========

    database.ref().push({
        name: name,
        destination: destination,
        frequency: frequency,
        firstTrain: firstTrain,
        dateAdded: firebase.database.ServerValue.TIMESTAMP
    });
});
// ===== FIREBASE WATCHER + initial loader ======
// ==============================================
database.ref().on(
    "child_added",
    function (childSnapshot) {

        // ========================================================
        // using moment to calculate: next arrival time & mins left
        // ========================================================

        // --- info of the new train added
        console.log(childSnapshot.val().firstTrain);
        console.log(childSnapshot.val().frequency);

        // --- store data for frequency (in minutes)
        var frequencyInMinutes = childSnapshot.val().frequency;
        console.log("frequency in minutes " + frequencyInMinutes);

        // --- current time formatted to match data
        var currentTime = moment().format("HH:mm");
        console.log("this is the current time " + currentTime);

        // --- store data for firstTrain 
        var firstTime = childSnapshot.val().firstTrain;

        // --- pushes back firstTime 1 year (calculation purposes)
        var referenceTime = moment(firstTime, "HH:mm").subtract(1, "years");
        console.log(referenceTime);

        // var differenceTime = (moment(currentTime)).diff(moment(referenceTime), "minutes");
        // console.log(differenceTime);

        var diffTime = moment().diff(moment(referenceTime), "minutes");
        console.log("this is the difference " + diffTime);

        // --- how many minutes has passed since last train
        var minutesSinceLast = diffTime % frequencyInMinutes;
        console.log("minutes since last train " + minutesSinceLast);

        // --- MINUTES UNTIL NEXT TRAIN ---
        var minutesUntilNext = frequencyInMinutes - minutesSinceLast;
        console.log("minutes until next train " + minutesUntilNext);

        var nextTrain = moment().add(minutesUntilNext, "minutes");

        // --- NEXT TRAIN ARRIVAL TIME ---
        var nextTrainTime = moment(nextTrain).format("HH:mm");
        console.log("Time for the next train formatted " + nextTrainTime);

        // ======================================================
        // =========== UPDATING HTML TO REFLECT DATA ============
        // ======================================================

        // --- new train info for HTML
        console.log(childSnapshot.val().name);
        console.log(childSnapshot.val().destination);
        console.log(childSnapshot.val().frequency);
        console.log(nextTrainTime);
        console.log(minutesUntilNext);

        console.log(typeof (nextTrainTime));   // string

        // --- array of train info
        var trainArr = [
            (childSnapshot.val().name),
            (childSnapshot.val().destination),
            (childSnapshot.val().frequency),
            (nextTrainTime),
            (minutesUntilNext)];

        // --- creates <tr> and appends to HTML 
        var trainDisplay = $("#logged-trains").append("<tr>");

        // === loop through array of train info ===
        // --- place them as text to <td>trainData 
        // --- append them to <tr>trainRow
        for (let i = 0; i < trainArr.length; i++) {

            var trainRow = trainDisplay.append($("<td>").text(trainArr[i]));
        }
    },
    // --- this handles the errors:
    function (errorObject) {
        console.log("errors: " + errorObject.code);
    });


