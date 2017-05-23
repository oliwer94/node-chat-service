var  moment = require('moment');

var generateMessage = (from,text) => {
    return  {from,text,createdAt:moment.now()};
};

var generateLocationMessage = (from,lat,long) => 
{
    return {
        'url':`https://www.google.com/maps?q=${lat},${long}`,
         from,
        'createdAt':moment.valueOf()
    };
};
module.exports = { generateMessage,generateLocationMessage};