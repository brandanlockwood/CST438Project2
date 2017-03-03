import app, unittest,os
class SocketIOTestCase(unittest.TestCase):
 
 def test_connect(self):
  client = app.socketio.test_client(app.app)
  r = client.get_received()
  #print r
  self.assertEquals(len(r), 2)
  from_server = r[0]
  self.assertEquals(
  from_server['name'],
  'login'
  )
  data = from_server['args'][0]
  #print data
  self.assertEquals(data, 'Login stuff')
  
  from_server = r[1]
  self.assertEquals(
  from_server['name'],
  'init'
  )
  data =from_server['args'][0]
  self.assertEquals(data['src'], '')
  self.assertEquals(data['name'],'')
  self.assertEquals(data['users'],[])
  
 def test_bot_Message(self):
  client = app.socketio.test_client(app.app)
  client.emit('bot', {
  'text': '!! hello'
  })
  r = client.get_received()
  from_server = r[2]
  self.assertEquals(
  from_server['name'],
  'bot'
  )
  data =from_server ['args'][0]
  self.assertEquals(data['text'], "Sorry I didn't get that")
  
  
  
 def test_user_loginGoogle(self):
   client = app.socketio.test_client(app.app)
   client.emit('login', {
   'name':'Brandan Lockwood',
   'url':'https://lh5.googleusercontent.com/-Ynt3zioTJn8/AAAAAAAAAAI/AAAAAAAAACY/AfF6ExgwYnY/s96-c/photo.jpg',
   })
   r = client.get_received()
   from_server = r[3]
   self.assertEquals(
   from_server['name'],
   'user:join'
   )
   data =from_server ['args'][0]
   self.assertEquals(data['src'], "https://lh5.googleusercontent.com/-Ynt3zioTJn8/AAAAAAAAAAI/AAAAAAAAACY/AfF6ExgwYnY/s96-c/photo.jpg")
   self.assertEquals(data['name'], "Brandan Lockwood")
   
 def test_user_Message(self):
   client = app.socketio.test_client(app.app)
   client.emit('send:message', {
   'user':'Brandan Lockwood',
   'src':'https://lh5.googleusercontent.com/-Ynt3zioTJn8/AAAAAAAAAAI/AAAAAAAAACY/AfF6ExgwYnY/s96-c/photo.jpg',
    'text': 'Whats up'
          
   })
   r = client.get_received()
 def test_disconnect(self):
   client = app.socketio.test_client(app.app)
   client.emit('disconnect')
   r = client.get_received()
if __name__ == '__main__':
 unittest.main()