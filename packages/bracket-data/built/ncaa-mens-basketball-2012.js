var _defaults = require('lodash-node/modern/objects/defaults');
var _each = require('lodash-node/modern/collections/forEach');
var _omit = require('lodash-node/modern/objects/omit');
var data = function (sport, year) {if (sport !== "ncaa-mens-basketball" || year !== "2012") throw new Error();return {"scoring":{"standard":[10,20,40,80,160,320],"gooley":[[1,1,1.1,1.3,1.4,1.5,1.7,2.1,1.9,2.5,3,3.4,4.5,8.2,27.2,212],[1.3,1.4,1.7,2.2,2.7,3.8,5.4,8.3,8.3,10.1,10.5,11.6,12.5,24.3,83.2,661.5],[1.8,2.3,3.2,5.3,7,10.1,13.2,21.1,22.5,31.2,38.2,64.1,87.4,158.5,480.2,4086.4],[2.8,4.2,6.7,11.4,17.1,27.2,39.2,62.9,72.3,115.5,162,275.3,456.3,1185.9,4650,48453.7],[4.8,7.9,14.2,27.2,45,77.8,120.3,206,254.4,444.4,705.1,1422.2,2960.3,10228.6,55928.1,837255.8],[8.3,15.4,31.6,68.2,124.9,234.6,388.2,708.3,939.9,1806.8,3290.6,8069.8,21888.8,105886.3,862483.7,20049447.2]]},"order":[1,16,8,9,5,12,4,13,6,11,3,14,7,10,2,15],"finalData":{"FF":{"name":"Final Four"}},"regions":[{"id":"S","name":"South","fullname":"South Region"},{"id":"W","name":"West","fullname":"West Region"},{"id":"E","name":"East","fullname":"East Region"},{"id":"MW","name":"Midwest","fullname":"Midwest Region"}],"teams":{"S":["Kentucky","Duke","Baylor","Indiana","Wichita St","UNLV","Notre Dame","Iowa St","UConn","Xavier","Colorado","VCU","New Mexico St","S Dakota St","Lehigh","Western Kentucky"],"W":["Mich St","Missouri","Marquette","Louisville","New Mexico","Murray St","Florida","Memphis","Saint Louis","Virginia","Colo St","L Beach St","Davidson","BYU","Norfolk St","LIU"],"E":["Syracuse","Ohio St","Florida St","Wisconsin","Vanderbilt","Cincy","Gonzaga","Kansas St","So Miss","W Virginia","Texas","Harvard","Montana","St B'nvntre","Loyola MD","UNC-Ash"],"MW":["UNC","Kansas","G'town","Michigan","Temple","SDSU","St Mary's","Creighton","Alabama","Purdue","NC State","USF","Ohio","Belmont","Detroit","UVM"]},"locks":"Thu Mar 15 16:15:00 +0000 2012"};};
var methods = {
    bracket: require('../lib/bracket'),
    constants: require('../lib/constants'),
    regex: require('../lib/regex'),
    order: function (data) {
        return data.order;
    },
    scoring: function (data) {
        return data.scoring;
    },
    locks: function (data) {
        return data.locks;
    }
};

function Bracket(options) {
    _defaults(options, {
        props: ['bracket'],
        year: new Date().getFullYear(),
        sport: 'ncaa-mens-basketball',
        defaults: {}
    });

    var bracketData = data(options.sport, options.year);

    _each(options.props, function (prop) {
        if (options.defaults.hasOwnProperty(prop)) throw new Error('Cant set default for an existing property');
        this[prop] = typeof methods[prop] === 'function' && methods[prop](bracketData);
    }, this);

    _defaults(this, _omit(options, ['props', 'year', 'sport'].concat(options.props)), options.defaults || {});
}

module.exports = Bracket;