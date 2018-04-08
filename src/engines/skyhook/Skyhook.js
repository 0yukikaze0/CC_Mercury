/**
 * SkyHook - Attitude based payload management algorithm
 * Version      :   1.0.5-Alpha
 * Author       :   Ashfaq Ahmed Shaik <https://github.com/0yukikaze0>
 * Description  :   This algorithm monitors current altitude, attitude angles in conjunction with various parameters.
 *                  Based on monitored values, it provides a decisive point on either grab or jettison payload
 *                  
 *                  Possible Attitude states    +-> Positive
 *                                              +-> Zero
 *                                              +-> Negative
 * 
 * CAUTION      :   This is experimental and undertested code. Use with caution. 
 */

class Skyhook {

    constructor(costs) {
        if(costs && (costs.buy && costs.sell)) {
            this._initialize(costs);
        } else {
            console.log('Insufficient initialization parameters');
            throw new Error('Insufficient initialization parameters');
        }
    }
    
    _initialize(costs){
        /** Set payload buy and sell costs */
        this._buyFee    = costs.buy;
        this._sellFee   = costs.sell;

        /** Tracking variables */
        this._highestAltitudeGain   = 0;
        this._lowestAltitudeLoss    = 0;
        this._lastAltitudeGain      = 0;
        this._lastAltitudeLoss      = 0;
        this._lastCoordinates       = {};
        this._payloadJettisoned     = true;

    }

    consult(altitude){

        /** Is this the first time we tlaking to this engine? */
        if(this._lastAltitudeGain === 0){
            
            this._highestAltitudeGain   = altitude;
            this._lowestAltitudeLoss    = altitude;
            this._lastAltitudeGain      = altitude;

            this._lastCoordinates = {
                x: new Date().getTime(),
                y: altitude
            }
            return this.respond('IDLE');
        }
        
        /**
         * [1]-> Calculate Attitude angle
         * [2]-> Check if we are carrying payload
         *          +-> If Yes -> Take a decision to either carry or jettison
         *          +-> If No  -> Take a decision to either stay idle of latch 
         */
        let attitude = this.calcAttitude(this._lastCoordinates, {x:new Date().getTime(), y: altitude});

        if(!this._payloadJettisoned){
            return this._decideToJettison(altitude, attitude);
        } else {
            return this._decideToLatch(altitude, attitude);
        }
        
    }

    registerExtremes(altitude){
        if(altitude > this._highestAltitudeGain){
            this._highestAltitudeGain = altitude;
        }

        if(altitude < this._lowestAltitudeLoss){
            this._lowestAltitudeLoss = altitude;
        }
    }

    _decideToLatch(altitude, attitude){
        
    }
    
    _decideToJettison(altitude, attitude){
        
        if(attitude.degrees === 0){
            return this.respond('HOLD');
        }
    
        if(attitude.degrees > 0) {
            /** We are still in a climb -> Hold */
            return this.respond('HOLD');
        }

        if(attitude.degrees < 0) {
            /**
             * We are in a dive. Take decisive measures by calculating below
             *  -> Has our altitude dropped below threshold ?
             *  -> How steep is our attitude angle change ?
             */
            let costs = this.calcCosts(this._highestAltitudeGain);
            
        }

    }

    /**
     * Calculates operating costs for current altitude
     * @param {Integer} - altitude
     * @returns {Object} - Operating costs 
     */
    calcCosts(altitude) {
        let buyCost = altitude * (this._buyFee / 100);
        let sellCost = altitude * (this._sellFee / 100);
        return {
            buyCost: buyCost,
            sellCost: sellCost
        }
    }

    /**
     * Calculates attitude angle between two cartesian coordinates
     * @returns {Object} - Angle in radians and Angle in degrees
     */
    calcAttitude(p, q) {
        /**
         * For provided cartesian coordinates p(x1,y1) q(x2,y2)
         * [1]-> Calculate angle in radians
         *          Ar = atan2((y2-y1) , (x2-x1))
         * [2]-> Convert radians to degrees
         *          Ad = (Ar) * (180/pi);
         */

        // [1]
        let radians = Math.atan2((q.y - p.y), (q.x - p.x));
        let degrees = parseFloat(radians * (180 / Math.PI)).toFixed(2);

        return {
            radians: radians,
            degrees: degrees
        }
    }

    respond(decision){
        return {
            decision : decision
        }
    }

}

module.exports = Skyhook;