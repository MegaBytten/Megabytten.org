const verify = require('../verification.js');

async function updateTrainings(trainingParams){
  console.log('Adding new Training to DB.');

  let query = "INSERT INTO trainings "
    + "(date_day, date_month, date_year, team, location, drills, time)"
    + " VALUES ('"
    + trainingParams[0][0] + "','"
    + trainingParams[0][1] + "','"
    + trainingParams[0][2] + "','"
    + trainingParams[1] + "','"
    + trainingParams[2] + "','"
    + trainingParams[3] + "','"
    + trainingParams[4] + "');"

    await verify.queryMySQL(query);
}

async function createTrainingTable(trainingID){
  console.log('Creating new table: training_' + trainingID);
  let query = "create table training_" + trainingID + " (rsvp_yes int not null default 0, rsvp_no int not null default 0);"
  await verify.queryMySQL(query);
}


//export functions to be used elsewhere
module.exports = { updateTrainings, createTrainingTable };
