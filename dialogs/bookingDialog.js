// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { TimexProperty } = require('@microsoft/recognizers-text-data-types-timex-expression');
const { InputHints, MessageFactory } = require('botbuilder');
const { ConfirmPrompt, TextPrompt, WaterfallDialog } = require('botbuilder-dialogs');
const { CancelAndHelpDialog } = require('./cancelAndHelpDialog');
const { DateResolverStartDialog } = require('./dateResolverStartDialog');
const { DateResolverEndDialog } = require('./dateResolverEndDialog');

const CONFIRM_PROMPT = 'confirmPrompt';
const DATE_RESOLVER_START_DIALOG = 'dateResolverStartDialog';
const DATE_RESOLVER_END_DIALOG = 'dateResolverEndDialog';
const TEXT_PROMPT = 'textPrompt';
const WATERFALL_DIALOG = 'waterfallDialog';

class BookingDialog extends CancelAndHelpDialog {
    constructor(id,cluRecognizer) {
        super(id || 'bookingDialog');

        this.addDialog(new TextPrompt(TEXT_PROMPT))
            .addDialog(new ConfirmPrompt(CONFIRM_PROMPT))
            .addDialog(new DateResolverStartDialog(DATE_RESOLVER_START_DIALOG))
            .addDialog(new DateResolverEndDialog(DATE_RESOLVER_END_DIALOG))
            .addDialog(new WaterfallDialog(WATERFALL_DIALOG, [
                this.destinationStep.bind(this),
                this.originStep.bind(this),
                this.travelStartDateStep.bind(this),
                this.travelEndDateStep.bind(this),
                this.budgetStep.bind(this),
                this.confirmStep.bind(this),
                this.finalStep.bind(this)
            ]));

        this.initialDialogId = WATERFALL_DIALOG;
        this.cluRecognizer =cluRecognizer
    }

    /**
     * If a destination city has not been provided, prompt for one.
     */
    async destinationStep(stepContext) {
        const bookingDetails = stepContext.options;

        if (!bookingDetails.dst_city) {
            const messageText = 'Hello, To what city would you like to travel ?';
            const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
            return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
        }
        return await stepContext.next(bookingDetails.dst_city);
    }

    /**
     * If an origin city has not been provided, prompt for one.
     */
    async originStep(stepContext) {
        const bookingDetails = stepContext.options;
        // try{
        //     const cluResult = await this.cluRecognizer.basicCluQuery(stepContext.options);
        //     console.log("++++++++++++++",cluResult.result.prediction.entities)
        // }
        // catch{
        //     console.log("wow")
        // }
  
        // Capture the response to the previous step's prompt
        bookingDetails.dst_city = stepContext.result;
        if (!bookingDetails.or_city) {
            const messageText = 'From what city will you be flying?';
            const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
            return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
        }
        return await stepContext.next(bookingDetails.or_city);
    }

    /**
     * If a travel start date has not been provided, prompt for one.
     * This will use the DATE_RESOLVER_DIALOG.
     */
    async travelStartDateStep(stepContext) {
        const bookingDetails = stepContext.options;
  
        // Capture the results of the previous step
        const cluResult = await this.cluRecognizer.basicCluQuery(stepContext.result)
        const fromEntities = this.cluRecognizer.getFromEntities(cluResult);
        bookingDetails.or_city = fromEntities.airport;
        if (!bookingDetails.str_date || this.isAmbiguous(bookingDetails.str_date)) {
            return await stepContext.beginDialog(DATE_RESOLVER_START_DIALOG, { date: bookingDetails.str_date });
        }
        return await stepContext.next(bookingDetails.str_date);
    }

    /**
     * If a travel end date has not been provided, prompt for one.
     * This will use the DATE_RESOLVER_DIALOG.
     */
    async travelEndDateStep(stepContext) {
        const bookingDetails = stepContext.options;
        // Capture the results of the previous step
        bookingDetails.str_date = stepContext.result;
        if (!bookingDetails.end_date || this.isAmbiguous(bookingDetails.end_date)) {
            return await stepContext.beginDialog(DATE_RESOLVER_END_DIALOG, { date: bookingDetails.end_date });
        }
        return await stepContext.next(bookingDetails.end_date);
    }

    /**
 * If budget has not been provided, prompt for one.
 */
    async budgetStep(stepContext) {
        const bookingDetails = stepContext.options;
        // Capture the response to the previous step's prompt
        bookingDetails.end_date = stepContext.result;
        if (!bookingDetails.budget) {
            const messageText = "Couldn't get the budget! can you please tell me your budget for the flights in USD ?";
            const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);
            return await stepContext.prompt(TEXT_PROMPT, { prompt: msg });
        }
        return await stepContext.next(bookingDetails.budget);
    }

    /**
     * Confirm the information the user has provided.
     */
    async confirmStep(stepContext) {
        const bookingDetails = stepContext.options;
        // Capture the results of the previous step
        const cluResult = await this.cluRecognizer.basicCluQuery(stepContext.result)
        let bud = this.cluRecognizer.getBudget(cluResult)
        if (/^[A-Za-z0-9]*$/.test(bud)){
            bookingDetails.budget = bud.replace(/[^0-9]/g, '') + " USD";
        }
        else{
            bookingDetails.budget = bud
        }
        
        const messageText = `Please confirm the flight details, you will be flying to: ${ bookingDetails.dst_city } from: ${ bookingDetails.or_city } on date: ${ bookingDetails.str_date } and returning on ${bookingDetails.end_date} and you have a budget of ${bookingDetails.budget}. Is this correct?`;
        const msg = MessageFactory.text(messageText, messageText, InputHints.ExpectingInput);

        // Offer a YES/NO prompt.
        return await stepContext.prompt(CONFIRM_PROMPT, { prompt: msg });
    }

    /**
     * Complete the interaction and end the dialog.
     */
    async finalStep(stepContext) {
        if (stepContext.result === true) {
            const bookingDetails = stepContext.options;
            return await stepContext.endDialog(bookingDetails);
        }
        return await stepContext.endDialog();
    }

    isAmbiguous(timex) {
        const timexPropery = new TimexProperty(timex);
        return !timexPropery.types.has('definite');
    }
}

module.exports.BookingDialog = BookingDialog;
