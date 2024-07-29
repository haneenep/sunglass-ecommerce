function validateForm() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    const downloadFormat = document.getElementById('downloadFormat').value;
    const timeInterval = document.getElementById('timeInterval').value;

    const startDateError = document.getElementById('startDateError');
    const endDateError = document.getElementById('endDateError');
    const downloadFormatError = document.getElementById('downloadFormatError');
    const generateReportBtn = document.getElementById('generateReportBtn');

    const timeIntervalSelect = document.getElementById('timeInterval');

    startDateError.innerHTML = "";
    endDateError.innerHTML = "";
    downloadFormatError.innerHTML = "";

    const currentDate = new Date().toISOString().split('T')[0];

    if (startDate > currentDate) {
        startDateError.innerHTML = "Start Date must be less than or equal to the current date";
    }

    if (endDate > currentDate) {
        endDateError.innerHTML = "End Date must be less than or equal to the current date";
    } else if (endDate < startDate) {
        endDateError.innerHTML = "End Date cannot be less than Start Date";
    }

    if (downloadFormat === "") {
        downloadFormatError.innerHTML = "Download Format is required";
    }

    if (startDate && endDate) {
        timeIntervalSelect.disabled = true;
    } else {
        timeIntervalSelect.disabled = false;
    }

    if (timeInterval) {
        document.getElementById('startDate').disabled = true;
        document.getElementById('endDate').disabled = true;
    } else {
        document.getElementById('startDate').disabled = false;
        document.getElementById('endDate').disabled = false;
    }

    if (!startDateError.innerHTML && !endDateError.innerHTML && !downloadFormatError.innerHTML) {
        generateReportBtn.disabled = false;
    } else {
        generateReportBtn.disabled = true;
    }
}
