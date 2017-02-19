# app.py
import os, flask, flask_socketio,requests
from flask_socketio import emit,send
from chatterbot import ChatBot
#TODO:Facebook login
app = flask.Flask(__name__)
socketio = flask_socketio.SocketIO(app)
chatbot = ChatBot(
    'Ron Obvious',
    trainer='chatterbot.trainers.ChatterBotCorpusTrainer'
)

# Train based on the english corpus
chatbot.train("chatterbot.corpus.english")

names=[{"name":"APPLICATION BOT","src":"http://vignette4.wikia.nocookie.net/scribblenauts/images/b/b3/Robot_Female.png/revision/latest?cb=20130119185217","id":0}]
messages=[]
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
 print messages
 username=getName()
 print "%s USER CONNECTED " %  flask.request.sid
 #names.append({'name':username,'src':'imageURL','id':flask.request.sid})
 emit('login','Login stuff')
 emit('init',{'users':[],'name':'','src':''},namespace='/')
 #socketio.emit('user:join', {'name': username,'src':'imageURL'},broadcast=True,include_self=False)  
@socketio.on('login')
def login(data):
 global messages
 print data['url']
 print data['name']
 print data
 names.append({'name':data['name'],'src':data['url'],'id':flask.request.sid})
 emit('init',{'users':names,'name':data['name'],'src':data['url'],'messages':messages},namespace='/')
 socketio.emit('user:join', {'name': data['name'],'src':data['url']},broadcast=True,include_self=False)
 messages.append({'user': 'APPLICATION BOT',
          'text' : data['name'] +' Joined',
          'src':'http://vignette4.wikia.nocookie.net/scribblenauts/images/b/b3/Robot_Female.png/revision/latest?cb=20130119185217'})

@socketio.on("facebookLogin")
def facebookLogin(data):
  print data
  response = requests.get('https://graph.facebook.com/v2.8/me?fields=id%2Cname%2Cpicture&access_token='+ data)
  json = response.json()
  names.append({'name':json['name'],'src':json['picture']['data']['url'],'id':flask.request.sid})
  emit('init',{'users':names,'name':json['name'],'src':json['picture']['data']['url'],'messages':messages},namespace='/')
  socketio.emit('user:join', {'name': json['name'],'src':json['picture']['data']['url']},broadcast=True,include_self=False)
  messages.append({'user': 'APPLICATION BOT',
          'text' : json['name'] +' Joined',
          'src':'http://vignette4.wikia.nocookie.net/scribblenauts/images/b/b3/Robot_Female.png/revision/latest?cb=20130119185217'})
 
@socketio.on('send:message')
def message_in(message):
    global messages
    messages.append(message)
    print message
    socketio.emit('send:message',message, broadcast=True,include_self=False)


@socketio.on('bot')
def bot_message(message):
 global messages
 command="!! chatBot"
 print command in message
 if(command in message and "!! help" not in message):
  newMessage=message.replace(command,"")
  newMessage=str(chatbot.get_response(message))
  print repr(newMessage)
  messages.append(message)
  socketio.emit('bot',newMessage,broadcast=True,include_self=True)
 else:
  messages.append(message)
  socketio.emit('bot',message, broadcast=True,include_self=True)
  
@socketio.on('disconnect')
def on_disconnect():
 print "USER DISCONNECTED"
 for key in names:
   if key["id"]==flask.request.sid:
    socketio.emit("user:left",key)
    messages.append({'user': 'APPLICATION BOT',
          'text' : key['name'] +' Joined',
          'src':'http://vignette4.wikia.nocookie.net/scribblenauts/images/b/b3/Robot_Female.png/revision/latest?cb=20130119185217'})
    names.remove(key)
    
  





 


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