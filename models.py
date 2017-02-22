# models.py
 
import flask_sqlalchemy, app
# app.app = app module's app variable
#TODO ADD Database grab info set to message array in init send messages list down and will be done with SE PROJECT!!!!!
#TODO REPLACE ALL ADD messges with DB adds :) add extra stuff more commands 

app.app.config['SQLALCHEMY_DATABASE_URI'] = app.os.getenv('DATABASE_URL')
db = flask_sqlalchemy.SQLAlchemy(app.app)

#db.create_all()
class ChatMessage(db.Model):
 id = db.Column(db.Integer, primary_key=True) # key
 name = db.Column(db.String(40))
 src = db.Column(db.String(1000))
 text = db.Column(db.String(1000))
 

 def __init__(self, name,src,text):
    self.text = text
    self.name=name
    self.src=src

 def __repr__(self): # what's __repr__?
    return '<Message: %s %s %s>' % (self.text,self.name,self.src)