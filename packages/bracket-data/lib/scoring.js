var scoringData = {
        2012: {
            standard: [10, 20, 40, 80, 160, 320]
        },
        2013: {
            gooley: [
                [1, 1, 1.1, 1.3, 1.4, 1.5, 1.7, 2, 2, 2.5, 3, 3.4, 4.5, 7.9, 24, 155.2],
                [1.3, 1.4, 1.7, 2.2, 2.7, 3.8, 5.3, 7.9, 8.4, 9.9, 10.3, 11.4, 12.6, 23.7, 73.9, 489.9],
                [1.8, 2.3, 3.2, 5.2, 7.0, 9.8, 12.8, 20, 22.5, 30.3, 37.2, 61.2, 85.1, 148.7, 418.1, 2980.1],
                [2.9, 4.2, 6.7, 11.2, 16.8, 26, 37.3, 58.5, 71.3, 110.5, 154.9, 259.9, 435.3, 1075.8, 3891.9, 33470.3],
                [4.8, 8, 14.3, 26.4, 43.7, 73.2, 112.6, 188.5, 247, 418.8, 663.8, 1314.6, 2736.4, 8869.5, 44100, 538667],
                [8.4, 15.6, 31.6, 65.4, 119.4, 216.3, 355.9, 636.1, 897.9, 1677.8, 3045.8, 7278.9, 19477.9, 86758, 629567.3, 11729601.9]
            ],
            standard: [10, 20, 40, 80, 160, 320]
        }
    };


module.exports = function (year) {
    return scoringData[year || new Date().getFullYear()];
};