selectedDate = new Date()
var trainingArrayJson = null;

function showHome(){
    let homePageObj = document.getElementById('homePage')
    homePageObj.style.display = 'flex'

    let eventsPageObj = document.getElementById('eventsPage')
    eventsPageObj.style.display = 'none'
}

function showEvents(){
    calendarInit(selectedDate)

    let homePageObj = document.getElementById('homePage')
    homePageObj.style.display = 'none'

    let eventsPageObj = document.getElementById('eventsPage')
    eventsPageObj.style.display = 'flex'

    const month = selectedDate.toLocaleString('default', { month: 'long' });
    var year = selectedDate.getFullYear();
    $.ajax({
        url: 'http://megabytten.org/eutrcapp/trainings.json',
        method: 'GET',
        headers: {
            "request": "calendar",
            month,
            year
        },
        success: function (response) {
            console.log('Successfully obtained training info. Loading it into calendar.');
            loadTrainings(response, selectedDate)
        }
    })
}

function nextMonth(){
    selectedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth()+1, 1);
    calendarInit(selectedDate)
    const month = selectedDate.toLocaleString('default', { month: 'long' });
    var year = selectedDate.getFullYear();
    $.ajax({
        url: 'http://megabytten.org/eutrcapp/trainings.json',
        method: 'GET',
        headers: {
            "request": "calendar",
            month,
            year
        },
        success: function (response) {
            console.log('Successfully obtained training info. Loading it into calendar.');
            loadTrainings(response, selectedDate)
        }
    })
}

function lastMonth(){
    selectedDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth()-1, 1);
    calendarInit(selectedDate)
    const month = selectedDate.toLocaleString('default', { month: 'long' });
    var year = selectedDate.getFullYear();
    $.ajax({
        url: 'http://megabytten.org/eutrcapp/trainings.json',
        method: 'GET',
        headers: {
            "request": "calendar",
            month,
            year
        },
        success: function (response) {
            console.log('Successfully obtained training info. Loading it into calendar.');
            loadTrainings(response, selectedDate)
        }
    })
}

function calendarInit(date) {
    //these lines set the H3 text as Month Year on the top of the calendar
    var monthName = new Intl.DateTimeFormat("en-US", { month: "long" }).format;
    var longName = monthName(date);
    var h3 = document.getElementById('month')
    h3.textContent = longName + " " + date.getFullYear();

    //these obtains the first day of the month
    const firstDayCurrentMonth = new Date(date.getFullYear(),  date.getMonth(), 1).getDay();
    let x = getFirstDayInt(firstDayCurrentMonth)
    
    // this hides the cells up until the first date
    for (y=1; y < x; y++){
        let cell = document.getElementById('cell' + y)
        cell.style.visibility = 'hidden'
    }

    // this sets all cells from the starting date until the last day of the month as visible
    var lastDayOfMonth = new Date(date.getFullYear(), date.getMonth()+1, 0).getDate();
    for (var day = 1; day <=lastDayOfMonth; day++){
        let cell = document.getElementById('cell' + x)
        cell.style.visibility = 'visible'
        
        // sets the textContent as the day number
        let cellHeader = document.getElementById('cell-date-' + x)
        cellHeader.textContent = day
        x++;
    }

    console.log(lastDayOfMonth);
    for (lastDayOfMonth; lastDayOfMonth < 42; lastDayOfMonth++){
        let cell = document.getElementById('cell' + x)
        if (cell == null){
            break;
        }
        cell.style.visibility = 'hidden'
        x++
    }
}

function loadTrainings(trainingArrayJson, date){
    $('.cell-training-info').html('') //uses jQuery to reset HTML content within all <span class='cell-training-info'>

    trainingArrayJson.forEach(training => {
        const firstDayCurrentMonth = new Date(date.getFullYear(),  date.getMonth(), 1).getDay();
        var dateInt = Number(training['date_day'])  + (getFirstDayInt(firstDayCurrentMonth)-1)
        var trainingDayCell = document.getElementById('cell-training-' + dateInt)
        trainingDayCell.innerHTML = trainingDayCell.innerHTML + "<br>" + training['team']

        if ($('#'+trainingDayCell.id).data() != null){
            var currentData = $('#'+trainingDayCell.id).data()
            currentData[training['id']] = training
        } else {
            var id = training['id']
            $('#'+trainingDayCell.id).data({id: training})
        }
        
    });
}

function viewTraining(clickedEl){
    if (this.innerHTML == ''){
        console.log("no training to view!");
    } else {
        $('.expanded-training-info').empty() //resets HTML

        var trainingJSON = $('#'+clickedEl.id).data()
        for (var training in trainingJSON) {
            console.log(JSON.stringify(trainingJSON[training]));
            $('.expanded-training-info').append(
                '<div>' +
                    '<h3>Training #' + trainingJSON[training]['id']  + '</h3>' +
                    '<span style="display:block">Time: ' + trainingJSON[training]['time'] + '</span>' +
                    '<span style="display:block">Team: ' + trainingJSON[training]['team'] + '</span>' +
                    '<span style="display:block">Location: ' + trainingJSON[training]['location'] + '</span>' +
                    '<span style="display:block">Drills: ' + trainingJSON[training]['drills'] + '</span>' +
                    '<span style="display:block">Attendance: ' + trainingJSON[training]['attendance'] + '</span>' +
                '</div>'
            )
        }
    }
}

//utility function
function getFirstDayInt(firstDay){
    switch (firstDay) {
        case 0:
            //sunday
            return 7
            break;
        case 1:
            //monday
            return 1
            break;
        case 2:
            //tuesday
            return 2
            break;
        case 3:
            //wednesday
            return 3
            break;
        case 4:
            //thursday
            return 4
            break;
        case 5:
            //friday
            return 5
            break;
        case 6:
            //saturday
            return 6
            break;
        default:
            break;
    }
}


function showMoves() {
    console.log('Moves!');
    $('#eventsPage').css('display', 'none')
    $('#homePage').css('display', 'none')
    $('#movesPage').css('display', 'flex')
}