var expect = require('expect');

var {generateMessage,generateLocationMessage} = require('./message');

describe('generateMessage', () => {

    it('should generate message object', () => {
        var text ='asdasd';
        var from = 'asd@asd.com';
        var messageObj = generateMessage(from, text);
        expect(messageObj).toBeA(Object);
        expect(messageObj.text).toBe(text);
        expect(messageObj.from).toBe(from);
        expect(messageObj.createdAt).toBeA('number');
    });
});

describe('generateLocationMessage', () => {

    it('should generate message object', () => {
        var from = 'asd@asd.com';
        var lat = 23.5;
        var long = 11.6;
        var url = 'https://www.google.com/maps?q=23.5,11.6';
        var messageObj = generateLocationMessage(from, lat,long);
        expect(messageObj).toBeA(Object);
        expect(messageObj.from).toBe(from);
        expect(messageObj.url).toBe(url);
    });
});