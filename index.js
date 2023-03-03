const fs = require('fs');
const { parse } = require('csv-parse');
const { stringify } = require('csv-stringify');

const FILE_NAME_RESULT = 'result.csv';
const FILE_NAME_WEATHER_DATA = 'weather.csv';
const FILE_NAME_BIKE_DATA = 'rides.csv';
const FILE_NAME_ALL_BIKE_DATA = 'allrides.csv';

const weatherRows = [];

// For debug
const failedBikeMatches = [];
const failedTotalBikeMatches = [];

/**
 * Read weather-data and save rows to weatherRows-object.
 */
function importWeatherRows() {
    fs.createReadStream(`./${FILE_NAME_WEATHER_DATA}`)
        .pipe(parse({ delimiter: ',', from_line: 2 }))
        .on('data', function (row) {
            const [ year, month, day, hour, , precipitation, temperature, wind ] = row;
            const date = `${day}.${month}.${year}`;
            const rowObject = {
                date,
                hour,
                precipitation: precipitation === '-' ? 0 : precipitation,
                temperature: temperature === '-' ? 0 : temperature,
                wind: wind === '-' ? 0 : wind,
                rides: 0,
                total_rides: 0
            };
            weatherRows.push(rowObject);
        })
        .on('end', function () {
            console.log('finished');
            addRides();
        })
        .on('error', function ({ message }) {
            console.error('ERROR WHEN PARSING WEATHER DATA', message);
        });
}

/**
 * Compare timestamp of both given rows.
 *
 * @FIXME: format biketime to correct format in advance (e.g. 21:00 instead of 21:06)
 * @param {*} bikeRow
 * @param {*} weatherRow
 * @param {boolean} debug - use this to compare data in weather vs ride -rows
 * @returns
 */
function bikeRowMatches(bikeRow, weatherRow, debug = false) {
    const { departure_time: bikeTime } = bikeRow;
    const { date: weatherTimeStamp, hour } = weatherRow;

    const bikeTimeStamp = bikeTime.slice(0, -2) + '00';

    if (debug) {
        console.log(`${bikeTime} vs ${weatherTimeStamp}`);
    }

    return bikeTimeStamp === `${weatherTimeStamp} ${hour}`;
}

function addRides() {
    console.log('Adding rides');
    fs.createReadStream(`./${FILE_NAME_BIKE_DATA}`)
        .pipe(parse({ delimiter: ';', from_line: 2 }))
        .on('data', function (row) {
            const [departure_time] = row;
            const bikeRowObject = { departure_time };
            const matchingWeatherTimeStampIdx = weatherRows
                .findIndex(weatherRow => bikeRowMatches(bikeRowObject, weatherRow));
            if (matchingWeatherTimeStampIdx !== -1) {
                weatherRows[matchingWeatherTimeStampIdx].rides++;
            } else {

                failedBikeMatches.push(bikeRowObject);
            }
        })
        .on('end', function () {
            console.log(`Added rides, there were ${failedBikeMatches.length} not matched.`);
            addTotalRides();
        })
        .on('error', function (error) {
            console.error('ERROR WHEN PARSING RIDES', error.message);
        });
}

function addTotalRides() {
    console.log('Adding total rides.');
    fs.createReadStream(`./${FILE_NAME_ALL_BIKE_DATA}`)
        .pipe(parse({ delimiter: ';', from_line: 2 }))
        .on('data', function (row) {
            const [departure_time, totalRides] = row;
            const totalRidesObject = { departure_time, totalRides };
            const matchingWeatherTimeStampIdx = weatherRows.findIndex(weatherRow => bikeRowMatches(totalRidesObject, weatherRow));
            if (matchingWeatherTimeStampIdx !== -1) {
                weatherRows[matchingWeatherTimeStampIdx].total_rides = totalRides;
            } else {
                failedTotalBikeMatches.push(totalRidesObject);
            }
        })
        .on('end', function () {
            console.log(`Added total rides, there were ${failedTotalBikeMatches.length} not matched.`);
            writeToFile();
        })
        .on('error', function (error) {
            console.error('ERROR WHEN PARSING ALL RIDES', error.message);
        });
}

function writeToFile() {
    const writableStream = fs.createWriteStream(FILE_NAME_RESULT);
    const RESULT_FILE_COLUMNS = ['date', 'hour', 'precipitation', 'temperature', 'wind', 'rides', 'total_rides'];
    const stringifier = stringify({ header: true, columns: RESULT_FILE_COLUMNS });
    weatherRows.forEach((row) => stringifier.write(row));
    stringifier.pipe(writableStream);

    console.log(`Wrote ${weatherRows.length} lines to ${FILE_NAME_RESULT}!`);
}

importWeatherRows();
