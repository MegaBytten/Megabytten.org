async function getNextTrainingsList() {

  const verify = require('./verification.js');
  console.log("Get-next-training.js running!");

  var resultsList = [null, null, null];


/*

BIG TODODODODODOODODODO
BIG TO DO TO DO TO DO TO do

NEED to rewrite my getNextTrainingsList query!!!
Incorrect querying with new sql data structure :(


*/



  var date_ob = new Date()
  let dateDay = ("0" + date_ob.getDate()).slice(-2);
  let dateMonth = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  let dateYear = date_ob.getFullYear();
  let formattedDate = dateDay+"/"+dateMonth+"/"+dateYear;

  //this forloop is for obtaining HP trainings
  //// TODO: very important! Only HP, DV, or CLUB can be accepted formats for trainings table!
  //// TODO: VERY IMPORTANT! Date must be specific format: dd/mm/yyyy
  console.log("finding next HP training.");
  for (let i = 0; i < 7; i++){
    let query = "select * from trainings where date_day = '" + formattedDate
    + "' and team = 'HP';";
    const sqlResult = await verify.queryMySQL(query);
    if (sqlResult[0] != null){
      //ARE results from HP trainings on this date!
      resultsList[0] = sqlResult[0];
      console.log("Next HP training got: " + JSON.stringify(resultsList[0]));
      break;
    } else if (i == 6){
      //No results within the week found
      console.log("No HP trainings within a week!");
      resultsList[0] = {
        "date":"none"
      }
    }
    //otherwise results turned up null - will change date to +1 and update formattedDate
    date_ob.setDate(date_ob.getDate() + 1);
    dateDay = ("0" + date_ob.getDate()).slice(-2);
    dateMonth = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    dateYear = date_ob.getFullYear();
    formattedDate = dateDay+"/"+dateMonth+"/"+dateYear;
  }

  //need to reset today's date
  date_ob = new Date()
  dateDay = ("0" + date_ob.getDate()).slice(-2);
  dateMonth = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  dateYear = date_ob.getFullYear();
  formattedDate = dateDay+"/"+dateMonth+"/"+dateYear;

  //this forloop is for obtaining DV trainings
  //// TODO: very important! Only HP, DV, or CLUB can be accepted formats for trainings table!
  //// TODO: VERY IMPORTANT! Date must be specific format: dd/mm/yyyy
  console.log("finding next DV training.");
  for (let i = 0; i < 7; i++){
    let query = "select * from trainings where date = '" + formattedDate
    + "' and team = 'DV';";
    const sqlResult = await verify.queryMySQL(query);
    if (sqlResult[0] != null){
      //ARE results from DEV trainings on this date!
      resultsList[1] = sqlResult[0];
      console.log("Next DV training got: " + JSON.stringify(resultsList[1]));
      break;
    } else if (i == 6){
      //No results within the week found
      console.log("No DV trainings within a week!");
      //asignment prevents passing "null" to client which cant be interpreted
      resultsList[1] = {
        "date":"none"
      }
    }

    //otherwise results turned up null - will change date to +1 and update formattedDate
    date_ob.setDate(date_ob.getDate() + 1);
    dateDay = ("0" + date_ob.getDate()).slice(-2);
    dateMonth = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    dateYear = date_ob.getFullYear();
    formattedDate = dateDay+"/"+dateMonth+"/"+dateYear;
  }

  //need to reset today's date
  date_ob = new Date()
  dateDay = ("0" + date_ob.getDate()).slice(-2);
  dateMonth = ("0" + (date_ob.getMonth() + 1)).slice(-2);
  dateYear = date_ob.getFullYear();
  formattedDate = dateDay+"/"+dateMonth+"/"+dateYear;

  //this forloop is for obtaining CLUB trainings
  //// TODO: very important! Only HP, DV, or CB can be accepted formats for trainings table!
  //// TODO: VERY IMPORTANT! Date must be specific format: dd/mm/yyyy
  console.log("finding next CB training.");
  for (let i = 0; i < 7; i++){
    let query = "select * from trainings where date = '" + formattedDate
    + "' and team = 'CB';";
    const sqlResult = await verify.queryMySQL(query);
    if (sqlResult[0] != null){
      //ARE results from DEV trainings on this date!
      resultsList[2] = sqlResult[0];
      console.log("Next CB training got: " + JSON.stringify(resultsList[2]));
      break;
    }else if (i == 6){
      //No results within the week found
      console.log("No CB trainings within a week!");
      resultsList[2] = {
        "date":"none"
      }
    }

    //otherwise results turned up null - will change date to +1 and update formattedDate
    date_ob.setDate(date_ob.getDate() + 1);
    dateDay = ("0" + date_ob.getDate()).slice(-2);
    dateMonth = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    dateYear = date_ob.getFullYear();
    formattedDate = dateDay+"/"+dateMonth+"/"+dateYear;
  }
  return resultsList;
}

function convertMonthHeader(month){
  switch (month) {
    case 'january':
      return 1;
      break;
    case 'febuary':
      return 2;
      break;
    case 'march':
      return 3;
      break;
    case 'april':
      return 4;
      break;
    case 'may':
      return 5;
      break;
    case 'june':
      return 6;
      break;
    case 'july':
      return 7;
      break;
    case 'august':
      return 8;
      break;
    case 'september':
      return 9;
      break;
    case 'october':
      return 10;
      break;
    case 'november':
      return 11;
      break;
    case 'december':
      return 12;
      break;
  }
}


//export functions to be used elsewhere
module.exports = {
  getNextTrainingsList,
  convertMonthHeader
};
