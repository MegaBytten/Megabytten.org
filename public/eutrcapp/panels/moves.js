// Class wide variables used for showMoves page
var categories = ['#moves_32', '#moves_mid', '#moves_misc']
var moves_32_index = 0
var moves_32_opened, moves_32_loaded = false

var moves_mid_index = 0
var moves_mid_opened, moves_mid_loaded = false

function showMoves() {
    console.log('Moves!');
    $('#eventsPage').css('display', 'none')
    $('#homePage').css('display', 'none')
    $('#movesPage').css('display', 'flex')
}

async function open32Slides(){
    if (moves_32_loaded){
        if(moves_32_opened) {
            $('#32s').hide()
            moves_32_opened = false;
            return;
        } else {
            $('#32s').show()
            moves_32_opened = true;
            return;
        }
    }

    $('#32s').append(
        await $.ajax({
            url: 'http://megabytten.org/eutrc/app/moves',
            headers: {
                category: categories[0],
                index: 0
            },
            method: 'get',
            dataType: 'html',
            success: function(data){
                console.log(`Post AJAX request! Category: ${categories[0]}, Index: 0!`);
            }
        })        
    )

    moves_32_opened = true;
    moves_32_loaded = true;
}

async function openMidSlides(){
    if (moves_mid_loaded){
        if(moves_mid_opened) {
            $('#mid').hide()
            moves_mid_opened = false;
            return;
        } else {
            $('#mid').show()
            moves_mid_opened = true;
            return;
        }
    }

    $('#mid').append(
        await $.ajax({
            url: 'http://megabytten.org/eutrc/app/moves',
            headers: {
                category: categories[1],
                index: 0
            },
            method: 'get',
            dataType: 'html',
            success: function(data){
                console.log(`Post AJAX request! Category: ${categories[1]}, Index: 0!`);
            }
        })        
    )

    moves_mid_opened = true;
    moves_mid_loaded = true;
}


function change32Slide(change) {
    console.log('Changing 32 slide! Change by: ' + change);
    moves_32_index += change
    loadSlide(categories[0], moves_32_index)
}

function changeMidSlide(change) {
    console.log('Changing MID slide! Change by: ' + change);
    moves_mid_index += change
    loadSlide(categories[1], moves_mid_index)
}

async function loadSlide (category, index){
    console.log('Loading slide: Requesting correct slide from server.'); //have debugged, selector is correctly selecting div.

    if (index < 0) {
        moves_32_index = 0
        console.log('Index of slide is <0, cancelling request.');
        return;
    }

    $(category).html(
        await  $.ajax({
            url: 'http://megabytten.org/eutrc/app/moves',
            headers: {
                category,
                index
            },
            method: 'get',
            dataType: 'html',
            success: function(data){
                console.log(`Post AJAX request! Category: ${category}, Index: ${index}!`);
                console.log(data);
            }
        })
    )

    //set onclick listeners to arrow keys!
}