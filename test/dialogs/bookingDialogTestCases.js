/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */


module.exports = [
    {
        name: 'Full flow',
        initialData: {},
        steps: [
            ['hi', 'Hello, To what city would you like to travel ?'],
            ['Seattle', 'From what city will you be flying?'],
            ['New York', "Couldn't get the travel date! On what date would you like to travel ?"],
            ['June 15 2024', "Couldn't get the return date! On what date would you like to return?"],
            ['July 15 2024', "Couldn't get the budget! can you please tell me your budget for the flights in USD ?"],
            ['1000', `Please confirm the flight details, you will be flying to: Seattle from: New York on date: 2024-06-15 and returning on 2024-07-15 and you have a budget of 1000 USD. Is this correct? (1) Yes or (2) No`],
            ['yes', null]
        ],
        expectedStatus: 'complete',
        expectedResult: {
            dst_city: 'Seattle',
            or_city: 'New York',
            str_date: '2024-06-15',
            end_date: '2024-07-15',
            budget: '1000 USD'
        }
    },
    {
        name: 'Full flow with \'no\' at confirmation',
        initialData: {},
        steps: [
            ['hi', 'Hello, To what city would you like to travel ?'],
            ['Seattle', 'From what city will you be flying?'],
            ['New York', "Couldn't get the travel date! On what date would you like to travel ?"],
            ['June 15 2024', "Couldn't get the return date! On what date would you like to return?"],
            ['July 15 2024', "Couldn't get the budget! can you please tell me your budget for the flights in USD ?"],
            ['1000', `Please confirm the flight details, you will be flying to: Seattle from: New York on date: 2024-06-15 and returning on 2024-07-15 and you have a budget of 1000 USD. Is this correct? (1) Yes or (2) No`],
            ['no', null]
        ],
        expectedStatus: 'complete',
        expectedResult: undefined
    },
    {
        name: 'Destination given',
        initialData: {
            dst_city: 'Bahamas'
        },
        steps: [
            ['Bahamas', 'From what city will you be flying?'],
            ['New York', "Couldn't get the travel date! On what date would you like to travel ?"],
            ['June 15 2024', "Couldn't get the return date! On what date would you like to return?"],
            ['July 15 2024', "Couldn't get the budget! can you please tell me your budget for the flights in USD ?"],
            ['1000', `Please confirm the flight details, you will be flying to: Bahamas from: New York on date: 2024-06-15 and returning on 2024-07-15 and you have a budget of 1000 USD. Is this correct? (1) Yes or (2) No`],
            ['yes', null]
        ],
        expectedStatus: 'complete',
        expectedResult: {
            dst_city: 'Bahamas',
            or_city: 'New York',
            str_date: '2024-06-15',
            end_date: '2024-07-15',
            budget: '1000 USD'
        }
    },
    {
        name: 'Destination and origin given',
        initialData: {
            dst_city: 'Seattle',
            or_city: 'New York'
        },
        steps: [
            ['New York', "Couldn't get the travel date! On what date would you like to travel ?"],
            ['June 15 2024', "Couldn't get the return date! On what date would you like to return?"],
            ['July 15 2024', "Couldn't get the budget! can you please tell me your budget for the flights in USD ?"],
            ['1000', `Please confirm the flight details, you will be flying to: Seattle from: New York on date: 2024-06-15 and returning on 2024-07-15 and you have a budget of 1000 USD. Is this correct? (1) Yes or (2) No`],
            ['yes', null]
        ],
        expectedStatus: 'complete',
        expectedResult: {
            dst_city: 'Seattle',
            or_city: 'New York',
            str_date: '2024-06-15',
            end_date: '2024-07-15',
            budget: '1000 USD'
        }
    }
];