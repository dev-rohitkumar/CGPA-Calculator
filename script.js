// CGPA Calculator JavaScript Functions

// Grade points mapping
const gradePoints = {
  'A+': 10, 'A': 9, 'B+': 8, 'B': 7,
  'C+': 6, 'C': 5, 'D+': 4, 'D': 3, 'QUALIFIED': 0
};

/**
 * Add a new row to the subjects table
 * @param {string} subject - Subject name
 * @param {string} credit - Credit value
 * @param {string} grade - Grade value
 */
function addRow(subject = '', credit = '', grade = 'A+') {
  const table = document.getElementById('subjectTable').getElementsByTagName('tbody')[0];
  const newRow = table.insertRow();
  newRow.innerHTML = `
    <td><input type="text" value="${subject}" placeholder="Subject Name" class="subject-input"></td>
    <td><input type="number" value="${credit}" min="0" step="0.5" class="credit-input"></td>
    <td>
      <select>
        ${Object.keys(gradePoints).map(g => `<option value="${g}" ${grade === g ? 'selected' : ''}>${g}</option>`).join('')}
      </select>
    </td>
    <td><button onclick="removeRow(this)">❌</button></td>
  `;
}

/**
 * Add multiple rows based on the subject count input
 */
function addMultipleRows() {
  const table = document.getElementById('subjectTable').getElementsByTagName('tbody')[0];
  const desiredCount = parseInt(document.getElementById('subjectCount').value);
  
  if (isNaN(desiredCount) || desiredCount <= 0) {
    alert('Enter a valid number of subjects.');
    return;
  }

  const currentCount = table.rows.length;
  const difference = desiredCount - currentCount;

  if (difference > 0) {
    for (let i = 0; i < difference; i++) {
      addRow();
    }
  } else if (difference < 0) {
    for (let i = 0; i < Math.abs(difference); i++) {
      table.deleteRow(table.rows.length - 1);
    }
  }

  setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 100);
}

/**
 * Add one row and increment the subject count
 */
function addOneRow() {
  const subjectCountInput = document.getElementById('subjectCount');
  const currentValue = parseInt(subjectCountInput.value) || 0;
  subjectCountInput.value = currentValue + 1;
  addMultipleRows();
}

/**
 * Remove a row from the table
 * @param {HTMLElement} button - The remove button that was clicked
 */
function removeRow(button) {
  const row = button.parentNode.parentNode;
  row.parentNode.removeChild(row);
  
  // Update the subject count input to reflect current number of rows
  const table = document.getElementById('subjectTable').getElementsByTagName('tbody')[0];
  const currentRowCount = table.rows.length;
  document.getElementById('subjectCount').value = currentRowCount;
}

/**
 * Calculate CGPA based on the entered subjects and grades
 */
function calculateCGPA() {
  const rows = document.getElementById('subjectTable').getElementsByTagName('tbody')[0].rows;
  let totalPoints = 0;
  let totalCredits = 0;

  for (let row of rows) {
    const credits = parseFloat(row.cells[1].querySelector('input').value);
    const grade = row.cells[2].querySelector('select').value.toUpperCase();
    if (!isNaN(credits) && grade !== 'QUALIFIED') {
      totalCredits += credits;
      totalPoints += credits * gradePoints[grade];
    }
  }

  const cgpa = (totalCredits > 0) ? (totalPoints / totalCredits).toFixed(2) : 'N/A';
  document.getElementById('output').innerText = `Total Credits: ${totalCredits}
Total Points: ${totalPoints}
🎓 CGPA: ${cgpa}`;
  
  // Show download button after calculation
  document.getElementById('downloadBtn').style.display = 'flex';
}

/**
 * Download CGPA report as PDF
 */
function downloadPDF() {
  // Prompt user for their name
  const studentName = prompt("Please enter your name for the CGPA report:");
  
  // If user cancels or enters empty name, don't proceed
  if (!studentName || studentName.trim() === '') {
    alert("Name is required to generate the PDF report.");
    return;
  }
  
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  
  // Clean white background - no gradients
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, 210, 297, 'F');
  
  // Simple header with minimal gradient
  doc.setFillColor(102, 126, 234);
  doc.rect(0, 0, 210, 50, 'F');
  
  // Clean title
  doc.setFontSize(22);
  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined, 'bold');
  doc.text('CGPA Calculator Report', 105, 20, { align: 'center' });
  
  // Student name
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined, 'bold');
  doc.text(`Student: ${studentName.trim()}`, 105, 32, { align: 'center' });
  
  // Date
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.setFont(undefined, 'normal');
  const currentDate = new Date();
  const formattedDate = `${currentDate.getDate().toString().padStart(2, '0')}/${(currentDate.getMonth() + 1).toString().padStart(2, '0')}/${currentDate.getFullYear()}`;
  doc.text(`Generated on: ${formattedDate}`, 105, 42, { align: 'center' });
  
  // Table headers
  doc.setFillColor(240, 240, 240);
  doc.rect(20, 70, 170, 15, 'F');
  
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, 'bold');
  doc.text('Subject', 25, 80);
  doc.text('Credits', 90, 80);
  doc.text('Grade', 120, 80);
  doc.text('Points', 150, 80);
  
  // Table border
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.rect(20, 70, 170, 15);
  
  // Table data
  const rows = document.getElementById('subjectTable').getElementsByTagName('tbody')[0].rows;
  let yPosition = 95;
  let totalCredits = 0;
  let totalPoints = 0;
  
  doc.setFont(undefined, 'normal');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const subject = row.cells[0].querySelector('input').value || `Subject ${i + 1}`;
    const credits = parseFloat(row.cells[1].querySelector('input').value) || 0;
    const grade = row.cells[2].querySelector('select').value;
    const points = credits * gradePoints[grade];
    
    if (credits > 0 && grade !== 'QUALIFIED') {
      totalCredits += credits;
      totalPoints += points;
    }
    
    // Alternating row background (very light)
    if (i % 2 === 0) {
      doc.setFillColor(250, 250, 250);
      doc.rect(20, yPosition - 8, 170, 12, 'F');
    }
    
    // Clean text with proper spacing
    const displaySubject = subject.length > 25 ? subject.substring(0, 22) + '...' : subject;
    
    doc.setTextColor(0, 0, 0);
    doc.text(displaySubject, 25, yPosition);
    doc.text(credits.toString(), 95, yPosition, { align: 'center' });
    doc.text(grade, 125, yPosition, { align: 'center' });
    doc.text(points.toFixed(1), 155, yPosition, { align: 'center' });
    
    // Simple row separator
    doc.setDrawColor(230, 230, 230);
    doc.line(20, yPosition + 3, 190, yPosition + 3);
    
    yPosition += 12;
    
    // Add new page if needed
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 30;
    }
  }
  
  // Summary section
  yPosition += 20;
  
  // Summary box
  doc.setFillColor(245, 245, 245);
  doc.rect(20, yPosition, 170, 40, 'F');
  doc.setDrawColor(102, 126, 234);
  doc.setLineWidth(1);
  doc.rect(20, yPosition, 170, 40);
  
  // Summary title
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.setFont(undefined, 'bold');
  doc.text('Summary', 25, yPosition + 12);
  
  // Summary details
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.text(`Total Credits: ${totalCredits}`, 25, yPosition + 22);
  doc.text(`Total Points: ${totalPoints.toFixed(1)}`, 25, yPosition + 32);
  
  // CGPA
  const cgpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : 'N/A';
  doc.setFont(undefined, 'bold');
  doc.setFontSize(16);
  
  // CGPA color (minimal color usage)
  if (cgpa >= 8.5) doc.setTextColor(0, 150, 0); // Dark green
  else if (cgpa >= 7) doc.setTextColor(0, 100, 200); // Dark blue
  else if (cgpa >= 6) doc.setTextColor(200, 100, 0); // Dark orange
  else doc.setTextColor(200, 0, 0); // Dark red
  
  doc.text(`CGPA: ${cgpa}`, 120, yPosition + 22);
  
  // Performance indicator
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  let performance = 'Needs Improvement';
  if (cgpa >= 9) performance = 'Excellent';
  else if (cgpa >= 8) performance = 'Very Good';
  else if (cgpa >= 7) performance = 'Good';
  else if (cgpa >= 6) performance = 'Average';
  
  doc.text(`(${performance})`, 120, yPosition + 32);
  
  // Clean footer
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.setFont(undefined, 'normal');
  doc.text('Made with Love by Rohit | CGPA Calculator © 2025', 105, 280, { align: 'center' });
  
  // Save the PDF with student name in filename
  const sanitizedName = studentName.trim().replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_');
  doc.save(`CGPA_Report_${sanitizedName}_${formattedDate.replace(/\//g, '-')}.pdf`);
}

/**
 * Initialize event listeners when the DOM is loaded
 */
function initializeEventListeners() {
  // Quick credit entry with Enter key
  document.getElementById('quickCredit').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const creditInput = e.target;
      const creditValue = creditInput.value;
      if (!creditValue) return;

      const credits = document.querySelectorAll('.credit-input');
      for (let i = 0; i < credits.length; i++) {
        if (!credits[i].value) {
          credits[i].value = creditValue;
          creditInput.value = '';
          creditInput.focus();
          return;
        }
      }
      alert("All visible credit fields are already filled.");
    }
  });

  // Enable pressing Enter on subjectCount to trigger row addition
  document.getElementById('subjectCount').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addMultipleRows();
      // Move cursor to quick credit input after adding rows
      setTimeout(() => {
        document.getElementById('quickCredit').focus();
      }, 150);
    }
  });

  // Add functionality for up/down spinner buttons
  document.getElementById('subjectCount').addEventListener('input', function(e) {
    // Small delay to ensure the value has been updated
    setTimeout(() => {
      addMultipleRows();
    }, 10);
  });

  // Navigate credit/subject fields with Enter and Backspace
  document.addEventListener('keydown', function(e) {
    const active = document.activeElement;
    if (active.classList.contains('credit-input') || active.classList.contains('subject-input')) {
      const inputs = [...document.querySelectorAll('.' + active.classList[0])];
      const index = inputs.indexOf(active);

      if (e.key === 'Enter') {
        e.preventDefault();
        if (index < inputs.length - 1) inputs[index + 1].focus();
      } else if (e.key === 'Backspace' && active.value === '') {
        e.preventDefault();
        if (index > 0) inputs[index - 1].focus();
      }
    }
  });
}

// Initialize event listeners when the DOM is loaded
document.addEventListener('DOMContentLoaded', initializeEventListeners);
