
/* =========================================
   PART 1: SELECTING HTML ELEMENTS
========================================= */

// Study form
const studyForm = document.getElementById("study-form");
const subjectInput = document.getElementById("subject");
const dateInput = document.getElementById("study-date");
const timeInput = document.getElementById("study-time");
const durationInput = document.getElementById("duration");

// Session list
const sessionsList = document.getElementById("sessions-list");

let currentFilter = "all";

// Subject summary
const subjectSummaryList =
    document.getElementById("subject-summary-list");

// Dashboard
const totalSessionsDisplay = document.getElementById("total-sessions");
const completedSessionsDisplay = document.getElementById("completed-sessions");
const pendingSessionsDisplay = document.getElementById("pending-sessions");
const upcomingDeadlinesDisplay = document.getElementById("upcoming-deadlines");

// Productivity
const studyProgress = document.getElementById("study-progress");
const progressPercentage = document.getElementById("progress-percentage");
const progressCompleted = document.getElementById("progress-completed");
const progressTotal = document.getElementById("progress-total");

// Deadline form
const deadlineForm = document.getElementById("deadline-form");
const taskNameInput = document.getElementById("task-name");
const deadlineSubjectInput = document.getElementById("deadline-subject");
const deadlineDateInput = document.getElementById("deadline-date");
const taskTypeInput = document.getElementById("task-type");

// Deadline list
const deadlinesList = document.getElementById("deadlines-list");


/* =========================================
   PART 2: LOCAL STORAGE
========================================= */

let studySessions =
    JSON.parse(localStorage.getItem("studySessions")) || [];

let deadlines =
    JSON.parse(localStorage.getItem("deadlines")) || [];


function saveData() {

    localStorage.setItem(
        "studySessions",
        JSON.stringify(studySessions)
    );

    localStorage.setItem(
        "deadlines",
        JSON.stringify(deadlines)
    );

}


function filterSessions(filter) {

    currentFilter = filter;
    displaySessions();

}


/* =========================================
   PART 3: DISPLAYING STUDY SESSIONS
========================================= */

function displaySessions() {

    sessionsList.innerHTML = "";

    // Sort sessions by date and time
    const sortedSessions = [...studySessions].sort(function(a, b) {

        const dateTimeA = new Date(a.date + "T" + a.time);
        const dateTimeB = new Date(b.date + "T" + b.time);

        return dateTimeA - dateTimeB;

    });


    // Filter sessions
    let filteredSessions = sortedSessions;

    if (currentFilter === "pending") {

        filteredSessions = sortedSessions.filter(function(session) {
            return session.completed !== true;
        });

    }
    else if (currentFilter === "completed") {

        filteredSessions = sortedSessions.filter(function(session) {
            return session.completed === true;
        });

    }


    // Empty state
    if (filteredSessions.length === 0) {

        const message = document.createElement("p");

        message.textContent = studySessions.length === 0
            ? "No study sessions yet. Add your first session!"
            : "No sessions found in this category.";

        sessionsList.appendChild(message);
        return;

    }


    // Display sessions
    filteredSessions.forEach(function(session) {

        const card = document.createElement("div");
        card.className = "session-card";

        const heading = document.createElement("h3");
        heading.textContent = session.subject;

        const details = document.createElement("p");

        details.textContent =
            session.date + " | " +
            session.time + " | " +
            session.duration + " minutes";

        card.appendChild(heading);
        card.appendChild(details);


        // Complete button
        const completeButton = document.createElement("button");

        completeButton.type = "button";

        completeButton.textContent = session.completed
            ? "Completed"
            : "Mark as Completed";

        completeButton.className = "button button-primary";
        completeButton.disabled = session.completed;

        completeButton.addEventListener("click", function() {

            session.completed = true;

            saveData();

            displaySessions();
            displaySubjectSummary();
            updateDashboard();

        });

        card.appendChild(completeButton);


        // Edit button
        const editButton = document.createElement("button");

        editButton.type = "button";
        editButton.textContent = "Edit";
        editButton.className = "button button-primary";

        editButton.addEventListener("click", function() {

            const newSubject = prompt(
                "Enter new subject:", session.subject
            );

            if (newSubject === null || newSubject.trim() === "") {
                return;
            }

            const newDate = prompt(
                "Enter new date (YYYY-MM-DD):", session.date
            );

            if (newDate === null || newDate.trim() === "") {
                return;
            }

            const newTime = prompt(
                "Enter new time (HH:MM):", session.time
            );

            if (newTime === null || newTime.trim() === "") {
                return;
            }

            const newDuration = Number(
                prompt(
                    "Enter new duration in minutes:", session.duration
                )
            );

            if (!Number.isFinite(newDuration) || newDuration <= 0) {

                alert("Please enter a valid duration.");
                return;

            }


            session.subject = newSubject.trim();
            session.date = newDate.trim();
            session.time = newTime.trim();
            session.duration = newDuration;

            saveData();

            displaySessions();
            displaySubjectSummary();
            updateDashboard();

        });

        card.appendChild(editButton);


        // Delete button
        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.className = "button button-secondary";

        deleteButton.addEventListener("click", function() {

            const index = studySessions.indexOf(session);

            if (index !== -1) {
                studySessions.splice(index, 1);
            }

            saveData();

            displaySessions();
            displaySubjectSummary();
            updateDashboard();

        });

        card.appendChild(deleteButton);

        sessionsList.appendChild(card);

    });

}


/* =========================================
   PART 4: SUBJECT-WISE SUMMARY
========================================= */

function displaySubjectSummary() {

    subjectSummaryList.innerHTML = "";

    // Store information for both sessions and deadlines
    const subjectData = Object.create(null);


    // Add study sessions to subject summary
    studySessions.forEach(function(session) {

        const subject = session.subject.trim();
        const subjectKey = subject.toLowerCase();

        if (!subjectData[subjectKey]) {

            subjectData[subjectKey] = {
                name: subject,
                sessions: 0,
                deadlines: 0,
                total: 0,
                completed: 0
            };

        }

        subjectData[subjectKey].sessions++;
        subjectData[subjectKey].total++;

        if (session.completed === true) {
            subjectData[subjectKey].completed++;
        }

    });


    // Add deadlines to subject summary
    deadlines.forEach(function(deadline) {

        const subject = deadline.subject
            ? deadline.subject.trim()
            : "Unassigned";

        const subjectKey = subject.toLowerCase();

        if (!subjectData[subjectKey]) {

            subjectData[subjectKey] = {
                name: subject,
                sessions: 0,
                deadlines: 0,
                total: 0,
                completed: 0
            };

        }

        subjectData[subjectKey].deadlines++;
        subjectData[subjectKey].total++;

        if (deadline.completed === true) {
            subjectData[subjectKey].completed++;
        }

    });


    // Empty state
    if (Object.keys(subjectData).length === 0) {

        const message = document.createElement("p");

        message.textContent =
            "No subject summary available. Add a study session or deadline first.";

        subjectSummaryList.appendChild(message);
        return;

    }


    // Display subject information
    for (const subjectKey in subjectData) {

        const data = subjectData[subjectKey];

        const pending = data.total - data.completed;

        const card = document.createElement("div");
        card.className = "session-card";

        const heading = document.createElement("h3");
        heading.textContent = data.name;

        const details = document.createElement("p");

        details.textContent =
            "Sessions: " + data.sessions +
            " | Deadlines: " + data.deadlines;

        const progress = document.createElement("p");

        progress.textContent =
            "Total: " + data.total +
            " | Completed: " + data.completed +
            " | Pending: " + pending;

        card.appendChild(heading);
        card.appendChild(details);
        card.appendChild(progress);

        subjectSummaryList.appendChild(card);

    }

}


/* =========================================
   PART 5: UPDATING DASHBOARD
========================================= */

function updateDashboard() {

    let completedCount = 0;
    let pendingCount = 0;


    studySessions.forEach(function(session) {

        if (session.completed === true) {
            completedCount++;
        }
        else {
            pendingCount++;
        }

    });


    // Update session counts
    totalSessionsDisplay.textContent = studySessions.length;
    completedSessionsDisplay.textContent = completedCount;
    pendingSessionsDisplay.textContent = pendingCount;


    // Calculate productivity
    let percentage = 0;

    if (studySessions.length > 0) {

        percentage = Math.round(
            (completedCount / studySessions.length) * 100
        );

    }


    studyProgress.value = percentage;

    progressPercentage.textContent = percentage + "%";
    progressCompleted.textContent = completedCount;
    progressTotal.textContent = studySessions.length;


    // Count upcoming deadlines
    const today = new Date();

    const todayString =
        today.getFullYear() + "-" +
        String(today.getMonth() + 1).padStart(2, "0") + "-" +
        String(today.getDate()).padStart(2, "0");

    let upcomingCount = 0;

    deadlines.forEach(function(deadline) {

        if (
            deadline.date >= todayString &&
            deadline.completed !== true
        ) {
            upcomingCount++;
        }

    });

    upcomingDeadlinesDisplay.textContent = upcomingCount;

}


/* =========================================
   PART 6: STUDY FORM SUBMISSION
========================================= */

studyForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const subject = subjectInput.value.trim();
    const date = dateInput.value;
    const time = timeInput.value;
    const duration = Number(durationInput.value);


    const session = {

        subject: subject,
        date: date,
        time: time,
        duration: duration,
        completed: false

    };


    studySessions.push(session);

    saveData();

    displaySessions();
    displaySubjectSummary();
    updateDashboard();

    studyForm.reset();

});


/* =========================================
   PART 7: DISPLAYING DEADLINES
========================================= */

function displayDeadlines() {

    deadlinesList.innerHTML = "";

    const today = new Date();

    const todayString =
        today.getFullYear() + "-" +
        String(today.getMonth() + 1).padStart(2, "0") + "-" +
        String(today.getDate()).padStart(2, "0");


    // Empty state
    if (deadlines.length === 0) {

        const message = document.createElement("p");

        message.textContent =
            "No deadlines added yet. Add your first deadline!";

        deadlinesList.appendChild(message);
        return;

    }


    deadlines.forEach(function(deadline) {

        const card = document.createElement("div");
        card.className = "session-card";

        const heading = document.createElement("h3");
        heading.textContent = deadline.taskName;

        const details = document.createElement("p");

        details.textContent =
            (deadline.subject || "Unassigned") +
            " | " + deadline.taskType +
            " | Due: " + deadline.date;


        // Deadline status
        const status = document.createElement("p");

        if (deadline.completed === true) {
            status.textContent = "Status: Completed";
        }
        else if (deadline.date < todayString) {
            status.textContent = "Status: Overdue";
        }
        else if (deadline.date === todayString) {
            status.textContent = "Status: Due Today";
        }
        else {
            status.textContent = "Status: Upcoming";
        }


        card.appendChild(heading);
        card.appendChild(details);
        card.appendChild(status);


        // Mark as Completed
        const completeButton = document.createElement("button");

        completeButton.type = "button";

        completeButton.textContent = deadline.completed
            ? "Completed"
            : "Mark as Completed";

        completeButton.className = "button button-primary";
        completeButton.disabled = deadline.completed;

        completeButton.addEventListener("click", function() {

            deadline.completed = true;

            saveData();

            displayDeadlines();
            displaySubjectSummary();
            updateDashboard();

        });

        card.appendChild(completeButton);


        // Edit deadline
        const editButton = document.createElement("button");

        editButton.type = "button";
        editButton.textContent = "Edit";
        editButton.className = "button button-primary";

        editButton.addEventListener("click", function() {

            const newTaskName = prompt(
                "Enter new task name:", deadline.taskName
            );

            if (newTaskName === null || newTaskName.trim() === "") {
                return;
            }

            const newSubject = prompt(
                "Enter subject:", deadline.subject || "Unassigned"
            );

            if (newSubject === null || newSubject.trim() === "") {
                return;
            }

            const newDate = prompt(
                "Enter new deadline (YYYY-MM-DD):", deadline.date
            );

            if (newDate === null || newDate.trim() === "") {
                return;
            }

            const newTaskType = prompt(
                "Enter task type (Assignment, Examination, Project, Other):",
                deadline.taskType
            );

            if (newTaskType === null || newTaskType.trim() === "") {
                return;
            }


            deadline.taskName = newTaskName.trim();
            deadline.subject = newSubject.trim();
            deadline.date = newDate.trim();
            deadline.taskType = newTaskType.trim();

            saveData();

            displayDeadlines();
            displaySubjectSummary();
            updateDashboard();

        });

        card.appendChild(editButton);


        // Delete deadline
        const deleteButton = document.createElement("button");

        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.className = "button button-secondary";

        deleteButton.addEventListener("click", function() {

            deadlines = deadlines.filter(function(item) {
                return item !== deadline;
            });

            saveData();

            // Immediately remove the clicked card
            card.remove();

            // Show empty state if no deadlines remain
            if (deadlines.length === 0) {
                displayDeadlines();
            }

            displaySubjectSummary();
            updateDashboard();

        });

        card.appendChild(deleteButton);

        deadlinesList.appendChild(card);

    });

}


/* =========================================
   PART 8: DEADLINE FORM SUBMISSION
========================================= */

deadlineForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const taskName = taskNameInput.value.trim();
    const subject = deadlineSubjectInput.value.trim();
    const deadlineDate = deadlineDateInput.value;
    const taskType = taskTypeInput.value;


    const deadline = {

        taskName: taskName,
        subject: subject,
        date: deadlineDate,
        taskType: taskType,
        completed: false

    };


    deadlines.push(deadline);

    saveData();

    displayDeadlines();
    displaySubjectSummary();
    updateDashboard();

    deadlineForm.reset();

});


/* =========================================
   PART 9: LOADING SAVED DATA
========================================= */

displaySessions();

displaySubjectSummary();

displayDeadlines();

updateDashboard();
