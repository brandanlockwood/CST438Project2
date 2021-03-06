# app.py
import os, flask, flask_socketio,requests
from flask_socketio import emit,send
from chatterbot import ChatBot
import json
import getInfo
from pyshorteners import Shortener


app = flask.Flask(__name__)
#os.environ["DATABASE_URL"]='postgresql://brandan:blockwood@localhost/postgres'
import models

socketio = flask_socketio.SocketIO(app)
chatbot = ChatBot(
    'Ron Obvious',
    trainer='chatterbot.trainers.ChatterBotCorpusTrainer'
)

# Train based on the english corpus
chatbot.train("chatterbot.corpus.english")

names=[{"name":"APPLICATION BOT","src":"http://i.imgur.com/94pZ4.gif","id":0}]
messages=[]


   
@app.route('/')
def hello():
 return flask.render_template('index.html')

@socketio.on('connect')
def on_connect():
 #print "%s USER CONNECTED " %  flask.request.sid
 #start chat 
 emit('login','Login stuff')
 emit('init',{'users':[],'name':'','src':''},namespace='/')
 
#Deal with google login stuff
@socketio.on('login')
def login(data):
 messageList=[]
 messsages=[]
 #grab all messages
 messages=models.ChatMessage.query.all()
 for m in messages:
  #print m.name
  #print m
  messageList.append({'user':m.name,'src':m.src,'text':m.text})
 conv=messages.reverse()
 names.append({'name':data['name'],'src':data['url'],'id':flask.request.sid})
 #emit to new client current data
 emit('init',{'users':names,'name':data['name'],'src':data['url'],'messages':messageList},namespace='/')
 #emit to all clients a new client has joined
 socketio.emit('user:join', {'name': data['name'],'src':data['url'],'show':True},broadcast=True,include_self=False)
 emit('user:join', {'name': data['name'],'src':data['url'],'show':False})
 #add applications bot join message
 userAdd=models.ChatMessage('APPLICATION BOT','http://i.imgur.com/94pZ4.gif',data['name'] +' Joined')
 models.db.session.add(userAdd)
 models.db.session.commit()
 #messageList.append({'user': 'APPLICATION BOT','text' : data['name'] +' Joined','src':'http://vignette4.wikia.nocookie.net/scribblenauts/images/b/b3/Robot_Female.png/revision/latest?cb=20130119185217'})

#Deal with facebook login stuff
@socketio.on("facebookLogin")
def facebookLogin(data):
  messageList=[]
  messsages=[]
  
  #Get all messages 
  messages=models.ChatMessage.query.all()
  for m in messages:
   #print m.name
   #print m
   #setup list to push down to client
   messageList.append({'user':m.name,'src':m.src,'text':m.text})
   #get user image with request to facebook graph api
  response = requests.get('https://graph.facebook.com/v2.8/me?fields=id%2Cname%2Cpicture&access_token='+ data)
  json = response.json()
  #Add user to list
  names.append({'name':json['name'],'src':json['picture']['data']['url'],'id':flask.request.sid})
  #send list based on database and user joining
  emit('init',{'users':names,'name':json['name'],'src':json['picture']['data']['url'],'messages':messageList},namespace='/')
  #emit to everybody someone has joined
  socketio.emit('user:join', {'name': json['name'],'src':json['picture']['data']['url'],'show':True},broadcast=True,include_self=False)
  emit('user:join', {'name': json['name'],'src':json['picture']['data']['url'],'show':False})
  #add application bot message
  #add user join message
  userAdd=models.ChatMessage('APPLICATION BOT','http://i.imgur.com/94pZ4.gif',json['name'] +' Joined')
  models.db.session.add(userAdd)
  models.db.session.commit()
  #messages.append({'user': 'APPLICATION BOT','text' : json['name'] +' Joined','src':'http://vignette4.wikia.nocookie.net/scribblenauts/images/b/b3/Robot_Female.png/revision/latest?cb=20130119185217'})
 
@socketio.on('send:message')
def message_in(message):
    #print message["text"]
    #messages.append(message)
    #add message to db
    print message
    url = str(message["text"])
    print getInfo.isUrl(url)
    if getInfo.isUrl(url):
     print "is a url"
     if getInfo.isImage(url):
      print "is image"
      #shortens url of image
      shortener = Shortener('Tinyurl')
      url=format(shortener.short(url))
      message={"user":message["user"],"src":message["src"],"url":url,"img":url}
      newMessage=models.ChatMessage(message["user"],message["src"],url)
     else:
      #shortens url of url
      shortener = Shortener('Tinyurl')
      url=format(shortener.short(url))
      message={"user":message["user"],"src":message["src"],"url":url}
      newMessage=models.ChatMessage(message["user"],message["src"],url)
    else:
     newMessage=models.ChatMessage(message["user"],message["src"],message["text"])
     print "not a url"
    print 'message sent'
    #add message to db
    models.db.session.add(newMessage)
    models.db.session.commit()
    socketio.emit('send:message',message, broadcast=True,include_self=True)


@socketio.on('bot')
def bot_message(message):
 #print message
 message = getInfo.chatBotMessage(str(message["text"]))
 #print message
 command="!! chatBot"
 #chatBot command
 if(command in message and "!! help" not in message):
  #get chatBot response
  newMessage=message.replace(command,"")
  newMessage=str(chatbot.get_response(message))
  print repr(newMessage)
 
  #save chat bot response to db
  botMessage=models.ChatMessage('APPLICATION BOT','http://i.imgur.com/94pZ4.gif',newMessage)
  models.db.session.add(botMessage)
  models.db.session.commit()
  #push bot message to all clients
  socketio.emit('bot',{"text":newMessage},broadcast=True,include_self=True)
 elif("!! find" in message and "!! help" not in message):
  message=message[8:]
  #get events from SeatGeek API
  items=getInfo.getEvents(message)
  print "No events in this area" in items
  if "No events in this area" in items:
   socketio.emit('bot',{"text":"No concerts found"},broadcast=True,include_self=True)
  else:
   socketio.emit('bot',{"list":items,"text":"Rock on"},broadcast=True,include_self=True)
 else:
  #add bot message to db
  botMessage=models.ChatMessage('APPLICATION BOT','http://i.imgur.com/94pZ4.gif',message)
  models.db.session.add(botMessage)
  models.db.session.commit()
  #push bot message to all clients
  socketio.emit('bot',{"text":message}, broadcast=True,include_self=True)
  
@socketio.on('disconnect')
def on_disconnect():
 global names
 print "USER DISCONNECTED"
 #find user who disconnected
 for key in names:
   if key["id"]==flask.request.sid:
    #emit to all clients who left
    socketio.emit("user:left",key)
    #add bot message that someone left
    userLeft=models.ChatMessage('APPLICATION BOT','http://i.imgur.com/94pZ4.gif',key['name'] +'Left')
    models.db.session.add(userLeft)
    models.db.session.commit()
   # messages.append({'user': 'APPLICATION BOT','text' : key['name'] +' Left','src':'http://vignette4.wikia.nocookie.net/scribblenauts/images/b/b3/Robot_Female.png/revision/latest?cb=20130119185217'})
    names.remove(key)

    
if __name__ == '__main__':# __name__!
 socketio.run(
 app,
 host=os.getenv('IP', '0.0.0.0'),
 port=int(os.getenv('PORT', 8080)),
 debug=True
 )