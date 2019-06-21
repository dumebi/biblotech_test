const redis = require('redis');
let client;

client = redis.createClient({
  url: process.env.REDIS_URL,
  retry_strategy: function retry(options) {
    console.log(options);
    if (options.error == null || options.error.code === 'ECONNREFUSED') {
      console.log('connection refused');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
      return new Error('Retry time exhausted');
    }

    return Math.max(options.attempt * 100, 2000);
  }
});


client.on('connect', () => {
  console.log('connected to redis server');
})

const {
  promisify
} = require('util');

const getAsync = promisify(client.get).bind(client);

exports.getAsync = getAsync;
exports.client = client;
