const chai      = require('chai');
const should    = chai.should();
const expect    = chai.expect;

const Skyhook   = require('../src/engines/skyhook/Skyhook');

/**
 * Test vectors
 */
var altitudes = [159908, 159908, 159990, 159808]

describe('Test : Initialization',() => {
    it('Initialization should pass', () => {
        expect(new Skyhook({buy:0.25,sell:0.25})).to.be.an('Object');
    });
    it('Inititalization should fail',(done) => {
        expect(()=>{new Skyhook()}).to.throw(Error);
        done();
    });
})

describe('Calculate attitude calculation', () => {
    /**
     * X coordinates would be current timestamps
     */
    let skyhook = new Skyhook({ buy: 0.25, sell: 0.25 });

    let anchor = new Date().getTime();
    it('Test : Cruise co ordinates result in 0 attitude', () => {
        let result = skyhook.calcAttitude({x:anchor,y:altitudes[0]},{x:anchor,y:altitudes[1]});
        expect(parseInt(result.degrees)).to.equal(0);
    });

    it('Test : Altitude gain should result in a positive attitude angle', () => {
        let result = skyhook.calcAttitude({ x: anchor, y: altitudes[0] }, { x: anchor, y: altitudes[2]});
        expect(parseInt(result.degrees)).to.be.above(0);
    });

    it('Test : Altitude loss should result in a negative attitude angle', () => {
        let result = skyhook.calcAttitude({ x: anchor, y: altitudes[0] }, { x: anchor, y: altitudes[3] });
        expect(parseInt(result.degrees)).to.be.below(0);
    });
})