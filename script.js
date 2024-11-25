const unitSelect = document.getElementById('unit');
const monthSelect = document.getElementById('month');
const dayInput = document.getElementById('day');
const yearInput = document.getElementById('year');
const chart = document.getElementById('chart');
const currentWeekSpan = document.getElementById('currentWeek');
const weeksRemainingSpan = document.getElementById('weeksRemaining');
const activitiesContainer = document.getElementById('activities');

let currentUnit = 'weeks';
const TOTAL_YEARS = 96;
const ROWS_PER_GROUP = 12;
const WEEKS_IN_YEAR = 52;
const AVERAGE_UK_LIFESPAN = 83.1;
const TOTAL_WEEKS = Math.round(AVERAGE_UK_LIFESPAN * WEEKS_IN_YEAR); // 4321 weeks

const activities = [
    { name: 'Sleep', hours: 56, color: '#FF6B6B' },
    { name: 'Work', hours: 40, color: '#4ECDC4' },
    { name: 'Commute', hours: 5, color: '#45B7D1' },
    { name: 'Eating', hours: 14, color: '#FED766' },
    { name: 'Personal care', hours: 7, color: '#F39C12' },
    { name: 'Household chores', hours: 7, color: '#9B59B6' },
    { name: 'Exercise', hours: 5, color: '#2ECC71' },
    { name: 'Leisure', hours: 21, color: '#e4c1f9' }
];

function populateMonths() {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    months.forEach((month, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = month;
        monthSelect.appendChild(option);
    });
}

function createChart() {
    chart.innerHTML = '';
    
    const totalUnits = getUnitCount(TOTAL_YEARS);
    for (let i = 0; i < totalUnits; i++) {
        if (i > 0 && i % (52 * ROWS_PER_GROUP) === 0) {
            const spacer = document.createElement('div');
            spacer.className = 'spacer';
            chart.appendChild(spacer);
        }
        const unit = document.createElement('div');
        unit.className = currentUnit.slice(0, -1); // 'week', 'month', or 'year'
        chart.appendChild(unit);
    }
}

function getUnitCount(years) {
    switch (currentUnit) {
        case 'weeks': return years * WEEKS_IN_YEAR;
        case 'months': return years * 12;
        case 'years': return years;
    }
}

function updateChart() {
    const birthDate = new Date(yearInput.value, monthSelect.value, dayInput.value);
    const today = new Date();
    const weeksPassed = getWeeksPassed(birthDate, today);
    const totalWeeks = getUnitCount(TOTAL_YEARS);

    const units = document.querySelectorAll(`.${currentUnit.slice(0, -1)}`);
    
    // Reset all units first
    units.forEach((unit, index) => {
        unit.className = currentUnit.slice(0, -1); // Reset class
        unit.style.backgroundColor = ''; // Reset any custom colors
        if (index < weeksPassed) {
            unit.classList.add('filled');
        } else {
            unit.style.backgroundColor = '#eee'; // Reset to default background
        }
    });

    // Only proceed with coloring activities if there are any selected
    const selectedActivities = getSelectedActivities();
    if (selectedActivities.length > 0) {
        let remainingWeeks = totalWeeks - weeksPassed;
        let currentWeek = weeksPassed;

        selectedActivities.forEach(activity => {
            const activityWeeks = Math.round((activity.hours / 168) * remainingWeeks);
            for (let i = 0; i < activityWeeks && currentWeek < totalWeeks; i++) {
                units[currentWeek].style.backgroundColor = activity.color;
                currentWeek++;
            }
            remainingWeeks -= activityWeeks;
        });
    }

    updateMetrics(weeksPassed, totalWeeks, totalWeeks - weeksPassed);
}

function getWeeksPassed(birthDate, today) {
    const msPassed = today - birthDate;
    return Math.floor(msPassed / (7 * 24 * 60 * 60 * 1000));
}

function updateMetrics(weeksPassed, totalWeeks, remainingWeeks) {
    currentWeekSpan.textContent = weeksPassed;
    weeksRemainingSpan.textContent = TOTAL_WEEKS;
}

function getSelectedActivities() {
    return activities.filter(activity => document.getElementById(activity.name).checked);
}

function createActivityCheckboxes() {
    activities.forEach(activity => {
        const div = document.createElement('div');
        div.className = 'flex items-center space-x-2';
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = activity.name;
        checkbox.className = 'form-checkbox h-5 w-5 text-indigo-600';
        checkbox.addEventListener('change', updateChart);
        const label = document.createElement('label');
        label.htmlFor = activity.name;
        label.className = 'flex items-center space-x-2 text-sm';
        label.innerHTML = `
            <span class="w-4 h-4 inline-block" style="background-color: ${activity.color};"></span>
            <span>${activity.name} (${activity.hours}h/week)</span>
        `;
        div.appendChild(checkbox);
        div.appendChild(label);
        activitiesContainer.appendChild(div);
    });
}

function changeUnit() {
    currentUnit = unitSelect.value;
    createChart();
    updateChart();
}

function loadSavedData() {
    const savedDOB = JSON.parse(localStorage.getItem('DOB'));
    if (savedDOB) {
        monthSelect.value = savedDOB.month;
        dayInput.value = savedDOB.day;
        yearInput.value = savedDOB.year;
    }

    const savedActivities = JSON.parse(localStorage.getItem('activities'));
    if (savedActivities) {
        savedActivities.forEach(activityName => {
            const checkbox = document.getElementById(activityName);
            if (checkbox) checkbox.checked = true;
        });
    }
}

function saveData() {
    localStorage.setItem('DOB', JSON.stringify({
        month: monthSelect.value,
        day: dayInput.value,
        year: yearInput.value
    }));

    const selectedActivities = getSelectedActivities().map(activity => activity.name);
    localStorage.setItem('activities', JSON.stringify(selectedActivities));
}

populateMonths();
createChart();
createActivityCheckboxes();
loadSavedData();
updateChart();

unitSelect.addEventListener('change', changeUnit);

[monthSelect, dayInput, yearInput].forEach(input => {
    input.addEventListener('change', () => {
        updateChart();
        saveData();
    });
});

window.addEventListener('beforeunload', saveData);