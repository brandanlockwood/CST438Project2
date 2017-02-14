import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Socket } from './socket';
import { Content } from './Content';

ReactDOM.render(<Content />, document.getElementById('content'));
Socket.on('connect', function() {
 console.log('Connecting to the server!');
})
