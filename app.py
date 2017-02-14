# app.py
import os, flask, flask_socketio
from flask_socketio import emit
app = flask.Flask(__name__)
socketio = flask_socketio.SocketIO(app)
@app.route('/')
def hello():
 return flask.render_template('index.html')
 
@socketio.on('connect')
def on_connect():
 print 'Someone connected!'

@socketio.on('disconnect')
def user_connect():
 print 'user joined'
 
@socketio.on('send:message')
def message_in(message):
    socketio.emit('send:message',message, broadcast=True,include_self=False)
    
@socketio.on('init')
def initial_in(something):
 print something+' ewfnawlengawnemglemwklamg'


      #socket.on('send:message', this._messageRecieve);
      #socket.on('user:join', this._userJoined);
      #socket.on('user:left', this._userLeft);
      #socket.on('change:name', this._userChangedName);
socketio.run(
 app,
 host=os.getenv('IP', '0.0.0.0'),
 port=int(os.getenv('PORT', 8080)),
 debug=True
)