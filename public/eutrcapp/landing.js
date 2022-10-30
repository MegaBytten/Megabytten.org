var trainingArrayJson = null;

function showHome(){
    let homePageObj = document.getElementById('homePage')
    homePageObj.style.display = 'flex'

    let eventsPageObj = document.getElementById('eventsPage')
    eventsPageObj.style.display = 'none'
}

async function showEvents(){
    $('#right-panel-container').html(
        await $.ajax({
            url: 'http://megabytten.org/eutrc/app/panel',
            method: 'GET',
            headers: {
                'panel': 'events'
            },
            success: function (response) {
                //successfully loaded in events page!
            }
        })
    )
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
                console.log(`Landing page loaded. Requesting default (home) panel!`);
            }
        })
    )
})