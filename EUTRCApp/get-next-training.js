async function getNextTrainingsList() {

  const verify = require('./verification.js');
  console.log("Get-next-training.js running!");

  var resultsList = [null, null, null];
  var date_ob = new Date()
  let dateDay = ("0" + date_ob.getDate()).slice(-2); //07
  let dateMonth = ("0" + (date_ob.getMonth() + 1).slice(-2); //07
  let dateYear = date_ob.getFullYear().slice(-2); //22



  //this forloop is for obtaining HP trainings
  //// TODO: very important! Only HP, DV, or CLUB can be accepted formats for trainings table!
  //// TODO: VERY IMPORTANT! Date must be specific format: dd/mm/yyyy
  console.log("finding next HP training.");
  for (let i = 0; i < 7; i++){
    let query = "select * from trainings where date_day = '" + dateDay
    + "' and team = 'HP' and date_month = '" + dateMonth "' and date_year = '" + dateYear + "';";
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
    dateDay = ("0" + date_ob.getDate()).slice(-2); //07
    dateMonth = ("0" + (date_ob.getMonth() + 1).slice(-2); //07
    dateYear = date_ob.getFullYear().slice(-2); //22
  }

  //need to reset today's date
  date_ob = new Date()
  dateDay = ("0" + date_ob.getDate()).slice(-2); //07
  dateMonth = ("0" + (date_ob.getMonth() + 1).slice(-2); //07
  dateYear = date_ob.getFullYear().slice(-2); //22

  //this forloop is for obtaining DV trainings
  //// TODO: very important! Only HP, DV, or CLUB can be accepted formats for trainings table!
  //// TODO: VERY IMPORTANT! Date must be specific format: dd/mm/yyyy
  console.log("finding next DV training.");
  for (let i = 0; i < 7; i++){
    let query = "select * from trainings where date_day = '" + dateDay
    + "' and team = 'DV' and date_month = '" + dateMonth "' and date_year = '" + dateYear + "';";
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
    dateDay = ("0" + date_ob.getDate()).slice(-2); //07
    dateMonth = ("0" + (date_ob.getMonth() + 1).slice(-2); //07
    dateYear = date_ob.getFullYear().slice(-2); //22
  }

  //need to reset today's date
  date_ob = new Date()
  dateDay = ("0" + date_ob.getDate()).slice(-2); //07
  dateMonth = ("0" + (date_ob.getMonth() + 1).slice(-2); //07
  dateYear = date_ob.getFullYear().slice(-2); //22

  //this forloop is for obtaining CLUB trainings
  //// TODO: very important! Only HP, DV, or CB can be accepted formats for trainings table!
  //// TODO: VERY IMPORTANT! Date must be specific format: dd/mm/yyyy
  console.log("finding next CB training.");
  for (let i = 0; i < 7; i++){
    let query = "select * from trainings where date_day = '" + dateDay
    + "' and team = 'CB' and date_month = '" + dateMonth "' and date_year = '" + dateYear + "';";
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
    dateDay = ("0" + date_ob.getDate()).slice(-2); //07
    dateMonth = ("0" + (date_ob.getMonth() + 1).slice(-2); //07
    dateYear = date_ob.getFullYear().slice(-2); //22
  }
  return resultsList;
}

//priv internal function
function resetDate (date_ob){

}

function convertMonthHeader(month){
  switch (month) {
    case 'JANUARY':
      return '01';
      break;
    case 'FEBRUARY':
      return '02';
      break;
    case 'MARCH':
      return '03';
      break;
    case 'APRIL':
      return '04';
      break;
    case 'MAY':
      return '05';
      break;
    case 'JUNE':
      return '06';
      break;
    case 'JULY':
      return '07';
      break;
    case 'AUGUST':
      return '08';
      break;
    case 'SEPTEMBER':
      return '09';
      break;
    case 'OCTOBER':
      return '10';
      break;
    case 'NOVEMBER':
      return '11';
      break;
    case 'DECEMBER':
      return '12';
      break;
  }
}


//export functions to be used elsewhere
module.exports = {
  getNextTrainingsList,
  convertMonthHeader
};
