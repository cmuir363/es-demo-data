export interface IotData {
    timestamp: string;
    rpm: string;
    temperature: string;
}

/**
 * Log into the system.
 * 
 * @param timeIntervals - The time interval in ms between producing each datapoint
 * @param callback - Function to run each time a data point is produced
 * 
 */
export const produceIotDataStream = (timeIntervals: number, callback: (data) => void): void => {
        setInterval(() => {

            const iotData: IotData = {
                timestamp: new Date().toISOString(),
                rpm: getRpm(1200, 1500).toString(),
                temperature: getTemperature(80, 100)
            }

            callback(iotData)
        }, timeIntervals)
}

function getRpm(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}

function getTemperature(min, max) {
    const num: number = Math.floor(Math.random() * (max - min) ) + min + Math.random()
    return num.toFixed(1);
}