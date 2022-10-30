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

$(document).ready(async function () {
    var name = $('input:hidden').val()
    $('#right-panel-container').html(
        await $.ajax({
            url: 'http://megabytten.org/eutrc/app/panel',
            headers: {
                name
            },
            method: 'get',
            dataType: 'html',
            success: function(data){
                console.log(`Post AJAX request! Loading home (default) panel!`);
            }
        })
    )
})