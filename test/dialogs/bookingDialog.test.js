/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/* eslint-env node, mocha */
const { DialogTestClient, DialogTestLogger } = require('botbuilder-testing');
const { BookingDialog } = require('../../dialogs/bookingDialog');
const { FlightBookingRecognizer } = require('../../recognizer/flightBookingRecognizer');
const path = require('path');
const ENV_FILE = path.join(__dirname, '../../.env');
require('dotenv').config({ path: ENV_FILE });
        // 
// If configured, pass in the FlightBookingRecognizer.  (Defining it externally allows it to be mocked for tests)
const { CluAPIKey, CluAPIHostName, CluProjectName, CluDeploymentName } = process.env;
const cluConfig = { endpointKey: CluAPIKey, endpoint: `https://${ CluAPIHostName }`, projectName: CluProjectName, deploymentName: CluDeploymentName };

const cluRecognizer = new FlightBookingRecognizer(cluConfig);
const assert = require('assert');
const bookingDialog = new BookingDialog('bookingDialog', cluRecognizer);

describe('BookingDialog', () => {
    const testCases = require('./bookingDialogTestCases.js');

    testCases.map(testData => {
        it(testData.name, async () => {
            const client = new DialogTestClient('test', bookingDialog, testData.initialData, [new DialogTestLogger()]);

            // Execute the test case
            console.log(`Test Case: ${ testData.name }`);
            console.log(`Dialog Input ${ JSON.stringify(testData.initialData) }`);
            for (let i = 0; i < testData.steps.length; i++) {
                const reply = await client.sendActivity(testData.steps[i][0]);
                assert.strictEqual((reply ? reply.text : null), testData.steps[i][1], `${ reply ? reply.text : null } != ${ testData.steps[i][1] }`);
            }

            assert.strictEqual(client.dialogTurnResult.status, testData.expectedStatus, `${ testData.expectedStatus } != ${ client.dialogTurnResult.status }`);

            console.log(`Dialog result: ${ JSON.stringify(client.dialogTurnResult.result) }`);
            if (testData.expectedResult !== undefined) {
                // Check dialog results
                const result = client.dialogTurnResult.result;
                assert.strictEqual(result.dst_city, testData.expectedResult.dst_city);
                assert.strictEqual(result.or_city, testData.expectedResult.or_city);
                assert.strictEqual(result.str_date, testData.expectedResult.str_date);    
                assert.strictEqual(result.end_date, testData.expectedResult.end_date);    
                assert.strictEqual(result.budget, testData.expectedResult.budget);    
            } else {
                assert.strictEqual(client.dialogTurnResult.result, undefined);
            }
        });
    });
});
