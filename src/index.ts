console.log('Happy developing ✨')

import client from './mongo-controller';

client.connect().then(() => console.log('Connected to MongoDB')).catch(err => console.error(err));