async function showHome(){
    $('#right-panel-container').html(
        await $.ajax({
            url: 'http://megabytten.org/eutrc/app/panel',
            method: 'GET',
            headers: {
                'panel': 'home'
            },
            success: function (response) {
                //successfully loaded in events page!
            }
        })
    )
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

async function showMoves(){
    $('#right-panel-container').html(
        await $.ajax({
            url: 'http://megabytten.org/eutrc/app/panel',
            method: 'GET',
            headers: {
                'panel': 'moves'
            },
            success: function (response) {
                //successfully loaded in moves page!
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