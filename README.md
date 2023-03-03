# Weather & Bike data wrangler

Quick throwaway script for combining 3 sources of data into one datasheet
- Weather data per hour
- Bike rides from a given station ( or as many bike-stations as you want )

You can edit the parser as you want, I just made it to fit certain needs.

## Setup

### Installation

Start out by installing the packages with `npm ci`.

### Input - adding datafiles

#### Weather

Expected weather data in CSV:

Save this file into the root of project as `weather.csv`

```
Year,m,d,Time,Time zone,Precipitation amount (mm),Air temperature (degC),Wind speed (m/s)
2021,4,23,4:00,UTC,5.4,0.7,1.2
```

**Pay attention to the time!** If you are who I think you are, you will have the time with 04:00 in your data for all timestamps between 00 - 09.

#### Rides

Expected ride data in CSV:
Save this file into the root of project as `rides.csv`

```
Departure;Departure station id;Departure station name;Return station id;Return station name;Covered distance (m)
1.4.2021 6:55;20;Kaisaniemenpuisto;60;Kaapelitehdas;3250
```

#### All rides

Expected "all rides" data in CSV:
Save this file into the root of project as `allrides.csv`

```
Timestamp;Rides
1.4.2021 1:00;0
```

## Usage

Use the tool with npm:

```
$ cd /path/to/project
$ npm run generate
```


# License

```
        DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
                    Version 2, December 2004

 Copyright (C) 2004 Sam Hocevar <sam@hocevar.net>

 Everyone is permitted to copy and distribute verbatim or modified
 copies of this license document, and changing it is allowed as long
 as the name is changed.

            DO WHAT THE FUCK YOU WANT TO PUBLIC LICENSE
   TERMS AND CONDITIONS FOR COPYING, DISTRIBUTION AND MODIFICATION

  0. You just DO WHAT THE FUCK YOU WANT TO.
  ```
