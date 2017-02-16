# app.py
import os, flask, flask_socketio
from flask_socketio import emit,send
app = flask.Flask(__name__)
socketio = flask_socketio.SocketIO(app)

names=[{"name":"APPLICATION BOT","src":"https://i.ytimg.com/vi/kpvKA0vhaT0/maxresdefault.jpg"}]
srcs=[]
i=0
def getName():
   global i
   i=i+1
   newName='guest'+str(i)
   print newName
   #names.append(newName)
   return newName
   
@app.route('/')
def hello():
 return flask.render_template('index.html')

@socketio.on('connect')
def on_connect():
 global names
 username=getName()
 names.append({'name':username,'src':'imageURL'})
 emit('init',{'users':names,'name':username,'src':'imageURL'},namespace='/')
 socketio.emit('user:join', {'name': username,'src':'imageURL'},broadcast=True,include_self=False)  


 
@socketio.on('send:message')
def message_in(message):
    print message
    socketio.emit('send:message',message, broadcast=True,include_self=False)

@socketio.on('bot')
def bot_message(message):
 socketio.emit('bot',message, broadcast=True,include_self=True)
  
@socketio.on('disconnect')
def on_disconnect():
 global names,i
 del names[0];
 i=i-1;



 


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