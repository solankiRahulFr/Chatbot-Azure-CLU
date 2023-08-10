// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { CluRecognizer } = require('../clu/cluRecognizer');

class FlightBookingRecognizer {
    constructor(config) {
        const cluIsConfigured = config && config.endpointKey && config.endpoint && config.projectName && config.deploymentName;
        if (cluIsConfigured) {
            this.recognizer = new CluRecognizer(config);
        }
    }

    get isConfigured() {
        return (this.recognizer !== undefined);
    }

    /**
     * Returns an object with preformatted CLU results for the bot's dialogs to consume.
     * @param {TurnContext} context
     */
    async executeCluQuery(context) {
        return await this.recognizer.recognizeAsync(context);
    }

    async basicCluQuery(text){
        return await this.recognizer.recognizeAsyncNormal(text);
    }


    getFromEntities(response) {
        var result = response.result.prediction;
        let fromValue;
        
        for (const entity of result.entities) {
            if (entity.category === 'or_city') {
                fromValue = entity.text;
            }
        }

        const fromAirportValue = fromValue;
        return { from: fromValue, airport: fromAirportValue };
    }

    getToEntities(response) {
        var result = response.result.prediction;
        let toValue;

        for (const entity of result.entities) {
            if (entity.category === 'dst_city') {
                toValue = entity.text;
            }
        }

        const toAirportValue = toValue;

        return { to: toValue, airport: toAirportValue };
    }

    /**
     * This value will be a TIMEX. And we are only interested in a Date so grab the first result and drop the Time part.
     * TIMEX is a format that represents DateTime expressions that include some ambiguity. e.g. missing a Year.
     */
    getStartDate(response) {
        const result = response.result.prediction;
        let fromDatetimeEntity;

        for (const entity of result.entities) {
            if (entity.category === 'str_date') {
                fromDatetimeEntity = entity.text;
            }
        }
        
        if (!fromDatetimeEntity || !fromDatetimeEntity[0]) return undefined;
        
        const timex = fromDatetimeEntity[0].timex;
        if (!timex) return undefined;
        return timex;
    }

    getEndDate(response) {
        const result = response.result.prediction;
        let endDatetimeEntity;

        for (const entity of result.entities) {
            if (entity.category === 'end_date') {
                endDatetimeEntity = entity.text;
            }
        }
        
        if (!endDatetimeEntity || !endDatetimeEntity[0]) return undefined;
        const timex = endDatetimeEntity[0].timex;
        if (!timex) return undefined;
        return timex;
    }

 
    getBudget(response) {
        var result = response.result.prediction;
        let budget;
        for (const entity of result.entities) {
            if (entity.category === 'budget') {
                budget = entity.text;
            }
        }
        return budget;
    }

    topIntent(response) {
        return response.result.prediction.topIntent;
    }
}

module.exports.FlightBookingRecognizer = FlightBookingRecognizer;
