// Fetch submission data from the server
fetch('http://localhost:3000/admin/enquiries')
  .then(response => {
    // Check if the response is OK
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    // Get the container where submissions will be displayed
    const submissionList = document.getElementById("submissionList");

    // Check if there are no submissions
    if (data.length === 0) {
      submissionList.innerHTML = "<p>No submissions yet.</p>";
      return;
    }

    // Loop through the submissions and add them to the list
    data.forEach(submission => {
      const listItem = document.createElement('div');
      listItem.classList.add('submission-container');

      listItem.innerHTML = `
        <h3>Pickup Location: ${submission.pickupLocation}</h3>
        <p><span class="field-label">Pickup Date:</span> ${submission.pickupDate}</p>
        <p><span class="field-label">Pickup Time:</span> ${submission.pickupTime}</p>
        <p><span class="field-label">Return Date:</span> ${submission.returnDate}</p>
        <p><span class="field-label">Return Time:</span> ${submission.returnTime}</p>
        <p><span class="field-label">Different Return Location:</span> ${submission.differentReturn ? 'Yes' : 'No'}</p>
        <hr>
      `;

      submissionList.appendChild(listItem);
    });
  })
  .catch(error => {
    console.error("Error fetching submissions:", error);
    const submissionList = document.getElementById("submissionList");
    submissionList.innerHTML = "<p>There was an error loading the submissions.</p>";
  });
