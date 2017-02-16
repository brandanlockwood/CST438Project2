
import React,{Component } from 'react';
import * as SocketIO from 'socket.io-client';

var socket = SocketIO.connect();
socket.emit('connect',function() {
console.log("Connected")
});

socket.on('disconnect', function() {

});

  
//User class with user name and image
 class User extends React.Component {
 render() {
 return <div>{this.props.name} <img id="userImage" src={this.props.src}/></div>;
 }
 }
 class UserList extends React.Component {
 render() {
 const listItems = this.props.users.map((user,index) => {
   console.log(user)
 return <User key={index} name={user["name"]} src={user["src"]} />;
 });
 return (
 <div id='users'>
   Online Users
 <ul>{listItems}</ul>
 </div>
 );
 }
}
var MessageList = React.createClass({
  render() {
      return (
          <div className='messages'id="messageList">
              <h2> Conversation: </h2>
              {
                  this.props.messages.map((message, i) => {
                  console.log(message);
                      return (
                      
                          <Message
                              key={i}
                              user={message.user}
                              text={message.text}
                              src={message.src}
                          />
                      );
                  })
              }
          </div>
      );
  }
});
var Message = React.createClass({
  render() {
      return (
          <div className="message">
             <img id="userImage" src={this.props.src} />
              <strong>{this.props.user} :</strong> 
              <span>{this.props.text}</span>        
          </div>
      );
  }
});
var MessageForm = React.createClass({

  getInitialState() {
      return {text: ''};
  },

  handleSubmit(e) {
      e.preventDefault();
      var message = {
          user : this.props.user,
          text : this.state.text,
          src  : this.props.src
      }
      this.props.onMessageSubmit(message); 
      this.setState({ text: '' });
  },

  changeHandler(e) {
      this.setState({ text : e.target.value });
  },

  render() {
      return(
          <div className='message_form' id="chatBox">
              <h3>Write New Message</h3>
              <form onSubmit={this.handleSubmit}>
                  <input
                      onChange={this.changeHandler}
                      value={this.state.text}
                  />
              </form>
          </div>
      );
  }
});




var ChatApp = React.createClass({

  getInitialState() {
      return {users: [], messages:[], text: ''};
  },

  componentDidMount() {
      
      socket.on('init', this._initialize);
      socket.on('send:message', this._messageRecieve);
      socket.on('user:join', this._userJoined);
      socket.on('user:left', this._userLeft);
      socket.on('bot',this._botMessage)
      
  },

  _initialize(data) {
      var {users, name,src} = data;
      console.log(src);
      this.setState({users, user: name,src: src});
  },

  _messageRecieve(message) {
      var {messages} = this.state;
      messages.push(message);
      this.setState({messages});
  },
  _botMessage(message)
  {
    var {messages} = this.state
     messages.push({ user: 'APPLICATION BOT',
          text : message,
          src :'https://i.ytimg.com/vi/kpvKA0vhaT0/maxresdefault.jpg'});
      this.setState({messages});
  },

  _userJoined(data) {
      var {users, messages} = this.state;
      var {name,src} = data;
      console.log(data+ "efwwwwwwwwwwwwwwwwwwwwwwwww")
      users.push({'name':name,'src':src});
      messages.push({
          user: 'APPLICATION BOT',
          text : name +' Joined',
          src :'https://i.ytimg.com/vi/kpvKA0vhaT0/maxresdefault.jpg'
      });
      this.setState({users, messages});
  },

  _userLeft(data) {
      var {users, messages} = this.state;
      var {name} = data;
      var index = users.indexOf(name);
      users.splice(index, 1);
      messages.push({
          user: 'APPLICATION BOT',
          text : name +' Left'
      });
      console.log(messages.name)
      this.setState({users, messages});
  },



  handleMessageSubmit(message) {
      var {messages} = this.state;
      messages.push(message);
      this.setState({messages});
     console.log(message)
      socket.emit('send:message', message);
      if(message.text=="!! about")
      {
        socket.emit('bot',"This room is for authorized potatos only");
      }else if(message.text=="!! help")
      {
        socket.emit('bot',"!! about -gives description of room\n"
        +"!! help -gives all commands of the room\n"
        +"!! say <something> makes me say <something>\n"
        +"!! potato will find a picture of a potato\n")
      }
      
  },

  

  render() {
      return (
          <div>
              <UserList
                  users={this.state.users}
              />
              <MessageList
                  messages={this.state.messages}
              />
              <MessageForm
                  onMessageSubmit={this.handleMessageSubmit}
                  user={this.state.user}
                  src={this.state.src}
              />
              
          </div>
      );
  }
});

//deals with background image
class GiveMeACat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fetchedData: React.PropTypes.string,
    };
  }

  componentDidMount() {
    this.setState({
          fetchedData: 'http://media.gettyimages.com/photos/-id546767922'

        });

  }

  render() {
    console.log(this.state.fetchedData);
    return (

      <div>
        {

            <img id="background"  src={this.state.fetchedData} alt="Cuteness"  />


        }
      </div>
    );
  }
}


export class Chat extends React.Component {
  render() {
    return (
      <div className="Chat">
       <ChatApp/>
        <GiveMeACat />
      </div>
    );
  }
}
