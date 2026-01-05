const { Kafka } = require('kafkajs');
const log4js = require('log4js');

log4js.configure({
    appenders: { 
        out: { type: 'stdout', layout: { type: 'dummy' } } // Raw JSON output
    },
    categories: { default: { appenders: ['out'], level: 'info' } }
});
const logger = log4js.getLogger();

//Configure Kafka consumer
const kafka = new Kafka({
    clientId: 'log-consumer',
    brokers: ['kafka:9092'] // Matches docker-compose service name
});

const consumer = kafka.consumer({ groupId: 'sre-monitoring-group' });

const run = async () => {
    try {
        await consumer.connect();
        console.log("Consumer connected to Kafka");

        //Subscribe to the topic 'user-activity', fromBeginning to get all messages even if sent before consumer started
        await consumer.subscribe({ topic: 'user-activity', fromBeginning: true });

        //Subscribe to CDC Changes topic
        await consumer.subscribe({ topic: 'db-changes', fromBeginning: true });

        await consumer.run({ 
            eachMessage: async ({ topic, partition, message }) => {
                const rawValue = message.value.toString();
                
                //Maintains the same structured logging format
                //We parse it and re-log it to prove it is processed.
                if (topic === 'user-activity') {
                    // Handle Login Logs
                    try {
                        const data = JSON.parse(rawValue);
                        console.log(`[USER EVENT]:`, JSON.stringify(data));
                    } catch(e) { console.log("Raw Event:", rawValue); }
                } 
                else if (topic === 'db-changes') {
                    //Handle Database Changes (CDC)
                    // TiCDC Open Protocol sends complex JSON. We log it to prove it works.
                    console.log(`[DB CHANGE DETECTED]:`, rawValue); 
                }
            },
        });
    } catch (err) {
        console.error("Error in consumer:", err);
        // Simple retry strategy
        setTimeout(run, 5000);
    }
};

run();