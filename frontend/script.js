console.log("SCRIPT.JS IS LOADED");

// ========================================
// AUTHENTICATION TOKEN
// ========================================

const token =
    localStorage.getItem("access_token");

if (!token) {

    window.location.href =
        "login.html";

}


// ========================================
// API URL
// ========================================

const API_URL = "http://localhost:8001";


// ========================================
// HTML ELEMENTS
// ========================================

const form =
    document.getElementById("depositForm");


const message =
    document.getElementById("message");


const editForm =
    document.getElementById("editForm");


const cancelEdit =
    document.getElementById("cancelEdit");


const searchInput =
    document.getElementById("searchInput");


const selectedDepositElement =
    document.getElementById("selectedDeposit");


const editButton =
    document.getElementById("editButton");


const reminderButton =
    document.getElementById("reminderButton");


const collectedButton =
    document.getElementById("collectedButton");


const deleteButton =
    document.getElementById("deleteButton");


// ========================================
// VARIABLES
// ========================================

let allDeposits = [];

let selectedCertificateNo = null;

let editingCertificateNo = null;


// ========================================
// LOAD DEPOSITS
// ========================================

async function loadDeposits() {

    console.log("Loading deposits...");

    try {

        const response =
            await fetch(
                `${API_URL}/deposits`,
                {
                    method: "GET",

                    headers: {
                        "Authorization":
                            `Bearer ${token}`
                    }
                }
            );


        console.log(
            "Response status:",
            response.status
        );


        // If token is invalid or expired
        if (response.status === 401) {

            localStorage.removeItem(
                "access_token"
            );

            window.location.href =
                "login.html";

            return;

        }


        const deposits =
            await response.json();


        console.log(
            "Deposits received:",
            deposits
        );


        allDeposits = deposits;


        displayDeposits(
            allDeposits
        );


        // Check whether selected deposit
        // still exists

        if (
            selectedCertificateNo &&
            !allDeposits.some(
                function(deposit) {

                    return (
                        deposit.certificate_no ===
                        selectedCertificateNo
                    );

                }
            )
        ) {

            clearSelection();

        }


    } catch (error) {

        console.error(
            "LOAD DEPOSITS ERROR:",
            error
        );


        message.textContent =
            "Could not connect to the API.";

    }

}


// ========================================
// DISPLAY DEPOSITS
// ========================================

function displayDeposits(deposits) {

    const tableBody =
        document.getElementById(
            "depositTableBody"
        );


    tableBody.innerHTML = "";


    deposits.forEach(
        function(deposit) {

            const row =
                document.createElement("tr");


            // =================================
            // SELECT RADIO BUTTON
            // =================================

            const selectCell =
                document.createElement("td");


            const radio =
                document.createElement("input");


            radio.type = "radio";

            radio.name = "depositSelection";

            radio.value =
                deposit.certificate_no;


            // Keep selected deposit selected
            // after searching or refreshing

            if (
                selectedCertificateNo ===
                deposit.certificate_no
            ) {

                radio.checked = true;

            }


            radio.addEventListener(
                "change",
                function() {

                    selectDeposit(
                        deposit.certificate_no
                    );

                }
            );


            selectCell.appendChild(
                radio
            );


            // =================================
            // BANK
            // =================================

            const bankCell =
                document.createElement("td");


            bankCell.textContent =
                deposit.bank;


            // =================================
            // CERTIFICATE
            // =================================

            const certificateCell =
                document.createElement("td");


            certificateCell.textContent =
                deposit.certificate_no;


            // =================================
            // AMOUNT
            // =================================

            const amountCell =
                document.createElement("td");


            amountCell.textContent =
                deposit.amount;


            // =================================
            // INTEREST
            // =================================

            const interestCell =
                document.createElement("td");


            interestCell.textContent =
                deposit.interest_rate + "%";


            // =================================
            // MATURITY DATE
            // =================================

            const maturityDateCell =
                document.createElement("td");


            maturityDateCell.textContent =
                deposit.maturity_date;


            // =================================
            // DAYS REMAINING
            // =================================

            const daysRemainingCell =
                document.createElement("td");


            const today =
                new Date();


            const maturityDate =
                new Date(
                    deposit.maturity_date
                );


            // Remove time component

            today.setHours(
                0,
                0,
                0,
                0
            );


            maturityDate.setHours(
                0,
                0,
                0,
                0
            );


            // Difference in milliseconds

            const difference =
                maturityDate - today;


            // Convert milliseconds to days

            const daysRemaining =
                Math.ceil(
                    difference /
                    (1000 * 60 * 60 * 24)
                );


            // Display appropriate message

            if (
                deposit.status ===
                "COLLECTED"
            ) {

                daysRemainingCell.textContent =
                    "Collected";

            } else if (
                daysRemaining > 0
            ) {

                daysRemainingCell.textContent =
                    daysRemaining +
                    " days";

            } else if (
                daysRemaining === 0
            ) {

                daysRemainingCell.textContent =
                    "Due today";

            } else {

                daysRemainingCell.textContent =
                    Math.abs(
                        daysRemaining
                    ) +
                    " days overdue";

            }


            // =================================
            // MATURITY AMOUNT
            // =================================

            const maturityAmountCell =
                document.createElement("td");


            maturityAmountCell.textContent =
                deposit.maturity_amount;


            // =================================
            // STATUS
            // =================================

            const statusCell =
                document.createElement("td");


            statusCell.textContent =
                deposit.status;


            // =================================
            // REMINDER COUNT
            // =================================

            const reminderCell =
                document.createElement("td");


            reminderCell.textContent =
                deposit.reminder_count;


            // =================================
            // EMAIL
            // =================================

            const emailCell =
                document.createElement("td");


            emailCell.textContent =
                deposit.email;


            // =================================
            // ADD CELLS TO ROW
            // =================================

            row.appendChild(
                selectCell
            );


            row.appendChild(
                bankCell
            );


            row.appendChild(
                certificateCell
            );


            row.appendChild(
                amountCell
            );


            row.appendChild(
                interestCell
            );


            row.appendChild(
                maturityDateCell
            );


            row.appendChild(
                daysRemainingCell
            );


            row.appendChild(
                maturityAmountCell
            );


            row.appendChild(
                statusCell
            );


            row.appendChild(
                reminderCell
            );


            row.appendChild(
                emailCell
            );


            tableBody.appendChild(
                row
            );

        }
    );

}


// ========================================
// SELECT DEPOSIT
// ========================================

function selectDeposit(
    certificateNo
) {

    console.log(
        "Selected deposit:",
        certificateNo
    );


    selectedCertificateNo =
        certificateNo;


    selectedDepositElement.textContent =
        certificateNo;


    // Enable buttons

    editButton.disabled = false;

    reminderButton.disabled = false;

    collectedButton.disabled = false;

    deleteButton.disabled = false;

}


// ========================================
// CLEAR SELECTION
// ========================================

function clearSelection() {

    selectedCertificateNo = null;


    selectedDepositElement.textContent =
        "None";


    editButton.disabled = true;

    reminderButton.disabled = true;

    collectedButton.disabled = true;

    deleteButton.disabled = true;

}


// ========================================
// ADD DEPOSIT
// ========================================

form.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        const depositData = {

            bank:
                document.getElementById(
                    "bank"
                ).value,


            certificate_no:
                document.getElementById(
                    "certificate_no"
                ).value,


            amount:
                parseFloat(
                    document.getElementById(
                        "amount"
                    ).value
                ),


            interest_rate:
                parseFloat(
                    document.getElementById(
                        "interest_rate"
                    ).value
                ),


            maturity_date:
                document.getElementById(
                    "maturity_date"
                ).value,


            maturity_amount:
                parseFloat(
                    document.getElementById(
                        "maturity_amount"
                    ).value
                ),


            email:
                document.getElementById(
                    "email"
                ).value

        };


        console.log(
            "Adding deposit:",
            depositData
        );


        try {

            const response =
                await fetch(
                    `${API_URL}/deposits`,
                    {

                        method: "POST",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`

                        },

                        body:
                            JSON.stringify(
                                depositData
                            )

                    }
                );


            const result =
                await response.json();


            console.log(
                "Add response:",
                result
            );


            if (response.ok) {

                message.textContent =
                    "Deposit added successfully!";


                form.reset();


                loadDeposits();


            } else if (
                response.status === 401
            ) {

                localStorage.removeItem(
                    "access_token"
                );

                window.location.href =
                    "login.html";


            } else {

                message.textContent =
                    "Error: " +
                    result.detail;

            }


        } catch (error) {

            message.textContent =
                "Could not connect to the API.";


            console.error(
                "ADD DEPOSIT ERROR:",
                error
            );

        }

    }
);


// ========================================
// SEARCH
// ========================================

searchInput.addEventListener(
    "input",
    function() {

        const searchText =
            searchInput.value
                .toLowerCase()
                .trim();


        console.log(
            "SEARCHING:",
            searchText
        );


        const filteredDeposits =
            allDeposits.filter(
                function(deposit) {

                    return (

                        deposit.bank
                            .toLowerCase()
                            .includes(
                                searchText
                            )

                        ||

                        deposit.certificate_no
                            .toLowerCase()
                            .includes(
                                searchText
                            )

                    );

                }
            );


        displayDeposits(
            filteredDeposits
        );

    }
);


// ========================================
// EDIT BUTTON
// ========================================

editButton.addEventListener(
    "click",
    function() {

        if (!selectedCertificateNo) {

            return;

        }


        editDeposit(
            selectedCertificateNo
        );

    }
);


// ========================================
// EDIT DEPOSIT
// ========================================

function editDeposit(
    certificateNo
) {

    console.log(
        "Editing certificate:",
        certificateNo
    );


    const deposit =
        allDeposits.find(
            function(item) {

                return (
                    item.certificate_no ===
                    certificateNo
                );

            }
        );


    if (!deposit) {

        alert(
            "Deposit not found."
        );

        return;

    }


    editingCertificateNo =
        deposit.certificate_no;


    const editFormContainer =
        document.getElementById(
            "editFormContainer"
        );


    editFormContainer.style.display =
        "block";


    document.getElementById(
        "editCertificateNo"
    ).value =
        deposit.certificate_no;


    document.getElementById(
        "editBank"
    ).value =
        deposit.bank;


    document.getElementById(
        "editAmount"
    ).value =
        deposit.amount;


    document.getElementById(
        "editInterestRate"
    ).value =
        deposit.interest_rate;


    document.getElementById(
        "editMaturityDate"
    ).value =
        deposit.maturity_date;


    document.getElementById(
        "editMaturityAmount"
    ).value =
        deposit.maturity_amount;


    document.getElementById(
        "editEmail"
    ).value =
        deposit.email;


    editFormContainer.scrollIntoView({
        behavior: "smooth"
    });

}


// ========================================
// SAVE EDITED DEPOSIT
// ========================================

editForm.addEventListener(
    "submit",
    async function(event) {

        event.preventDefault();


        if (!editingCertificateNo) {

            alert(
                "No deposit selected for editing."
            );

            return;

        }


        const updateData = {

            bank:
                document.getElementById(
                    "editBank"
                ).value,


            amount:
                parseFloat(
                    document.getElementById(
                        "editAmount"
                    ).value
                ),


            interest_rate:
                parseFloat(
                    document.getElementById(
                        "editInterestRate"
                    ).value
                ),


            maturity_date:
                document.getElementById(
                    "editMaturityDate"
                ).value,


            maturity_amount:
                parseFloat(
                    document.getElementById(
                        "editMaturityAmount"
                    ).value
                ),


            email:
                document.getElementById(
                    "editEmail"
                ).value

        };


        console.log(
            "Updating certificate:",
            editingCertificateNo
        );


        console.log(
            "Update data:",
            updateData
        );


        try {

            const response =
                await fetch(
                    `${API_URL}/deposits/${editingCertificateNo}`,
                    {

                        method: "PATCH",

                        headers: {

                            "Content-Type":
                                "application/json",

                            "Authorization":
                                `Bearer ${token}`

                        },

                        body:
                            JSON.stringify(
                                updateData
                            )

                    }
                );


            const result =
                await response.json();


            console.log(
                "Update response:",
                result
            );


            if (response.ok) {

                message.textContent =
                    "Deposit updated successfully!";


                document.getElementById(
                    "editFormContainer"
                ).style.display =
                    "none";


                editForm.reset();


                editingCertificateNo =
                    null;


                loadDeposits();


            } else if (
                response.status === 401
            ) {

                localStorage.removeItem(
                    "access_token"
                );

                window.location.href =
                    "login.html";


            } else {

                message.textContent =
                    "Error: " +
                    result.detail;

            }


        } catch (error) {

            message.textContent =
                "Could not connect to the API.";


            console.error(
                "UPDATE ERROR:",
                error
            );

        }

    }
);


// ========================================
// CANCEL EDIT
// ========================================

cancelEdit.addEventListener(
    "click",
    function() {

        console.log(
            "Edit cancelled"
        );


        document.getElementById(
            "editFormContainer"
        ).style.display =
            "none";


        editForm.reset();


        editingCertificateNo =
            null;

    }
);


// ========================================
// SEND REMINDER BUTTON
// ========================================

reminderButton.addEventListener(
    "click",
    function() {

        if (!selectedCertificateNo) {

            return;

        }


        sendReminder(
            selectedCertificateNo
        );

    }
);


// ========================================
// SEND REMINDER
// ========================================

async function sendReminder(
    certificateNo
) {

    const confirmed =
        confirm(
            "Send a reminder email for this deposit?"
        );


    if (!confirmed) {

        return;

    }


    console.log(
        "Sending reminder for:",
        certificateNo
    );


    try {

        const response =
            await fetch(
                `${API_URL}/deposits/${certificateNo}/remind`,
                {

                    method: "POST",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        const result =
            await response.json();


        console.log(
            "Reminder response:",
            result
        );


        if (response.ok) {

            message.textContent =
                "Reminder email sent successfully!";


            loadDeposits();


        } else if (
            response.status === 401
        ) {

            localStorage.removeItem(
                "access_token"
            );

            window.location.href =
                "login.html";


        } else {

            message.textContent =
                "Error: " +
                result.detail;

        }


    } catch (error) {

        message.textContent =
            "Could not connect to the API.";


        console.error(
            "REMINDER ERROR:",
            error
        );

    }

}


// ========================================
// MARK COLLECTED BUTTON
// ========================================

collectedButton.addEventListener(
    "click",
    function() {

        if (!selectedCertificateNo) {

            return;

        }


        markCollected(
            selectedCertificateNo
        );

    }
);


// ========================================
// MARK COLLECTED
// ========================================

async function markCollected(
    certificateNo
) {

    const confirmed =
        confirm(
            "Mark this deposit as collected?"
        );


    if (!confirmed) {

        return;

    }


    console.log(
        "Marking collected:",
        certificateNo
    );


    try {

        const response =
            await fetch(
                `${API_URL}/deposits/${certificateNo}/collected`,
                {

                    method: "PATCH",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        const result =
            await response.json();


        console.log(
            "Collected response:",
            result
        );


        if (response.ok) {

            message.textContent =
                "Deposit marked as collected!";


            loadDeposits();


        } else if (
            response.status === 401
        ) {

            localStorage.removeItem(
                "access_token"
            );

            window.location.href =
                "login.html";


        } else {

            message.textContent =
                "Error: " +
                result.detail;

        }


    } catch (error) {

        message.textContent =
            "Could not connect to the API.";


        console.error(
            "COLLECTED ERROR:",
            error
        );

    }

}


// ========================================
// DELETE BUTTON
// ========================================

deleteButton.addEventListener(
    "click",
    function() {

        if (!selectedCertificateNo) {

            return;

        }


        deleteDeposit(
            selectedCertificateNo
        );

    }
);


// ========================================
// DELETE DEPOSIT
// ========================================

async function deleteDeposit(
    certificateNo
) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this deposit?"
        );


    if (!confirmed) {

        return;

    }


    console.log(
        "Deleting:",
        certificateNo
    );


    try {

        const response =
            await fetch(
                `${API_URL}/deposits/${certificateNo}`,
                {

                    method: "DELETE",

                    headers: {

                        "Authorization":
                            `Bearer ${token}`

                    }

                }
            );


        const result =
            await response.json();


        console.log(
            "Delete response:",
            result
        );


        if (response.ok) {

            message.textContent =
                "Deposit deleted successfully!";


            clearSelection();


            loadDeposits();


        } else if (
            response.status === 401
        ) {

            localStorage.removeItem(
                "access_token"
            );

            window.location.href =
                "login.html";


        } else {

            message.textContent =
                "Error: " +
                result.detail;

        }


    } catch (error) {

        message.textContent =
            "Could not connect to the API.";


        console.error(
            "DELETE ERROR:",
            error
        );

    }

}


// ========================================
// INITIAL LOAD
// ========================================

loadDeposits();

// ========================================
// LOGOUT
// ========================================

// ========================================
// LOGOUT
// ========================================

const logoutButton =
    document.getElementById("logoutButton");

if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        function() {

            localStorage.removeItem(
                "access_token"
            );

            window.location.href =
                "login.html";
        }
    );
}