import { browser, element, by } from 'protractor';

describe('angular homepage', function () {
    it('should get hello angular', function () {
        browser.get('/');
        let txt = element(by.css('app-cookapp h1')).getText();
        expect(txt).toEqual('Hello Angular');
    });
});
