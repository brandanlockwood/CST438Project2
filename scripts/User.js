
import React,{Component } from 'react';
import * as SocketIO from 'socket.io-client';

var socket = SocketIO.connect();
socket.emit('connect',function() {
console.log("Connected")
});

socket.on('disconnect', function() {

});

  

 class User extends React.Component {
 render() {
 return <div>{this.props.name} <img  src={this.props.src}/></div>;
 }
 }
 class UserList extends React.Component {
 render() {
 const listItems = this.props.users.map((a,index) => {
 return <User key={index} name={a} />;
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
                      return (
                          <Message
                              key={i}
                              user={message.user}
                              text={message.text}
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
          text : this.state.text
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
  },

  _initialize(data) {
      var {users, name} = data;
      console.log(data);
      this.setState({users, user: name});
  },

  _messageRecieve(message) {
      var {messages} = this.state;
      messages.push(message);
      this.setState({messages});
  },

  _userJoined(data) {
      var {users, messages} = this.state;
      var {name} = data;
      users.push(name);
      messages.push({
          user: 'APPLICATION BOT',
          text : name +' Joined'
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

  _userChangedName(data) {
      var {oldName, newName} = data;
      var {users, messages} = this.state;
      var index = users.indexOf(oldName);
      users.splice(index, 1, newName);
      messages.push({
          user: 'APPLICATION BOT',
          text : 'Change Name : ' + oldName + ' ==> '+ newName
      });
      this.setState({users, messages});
  },

  handleMessageSubmit(message) {
      var {messages} = this.state;
      messages.push(message);
      this.setState({messages});
      console.log(message.name)
      socket.emit('send:message', message);
  },

  handleChangeName(newName) {
      var oldName = this.state.user;
      socket.emit('change:name', { name : newName}, (result) => {
          if(!result) {
              return alert('There was an error changing your name');
          }
          var {users} = this.state;
          var index = users.indexOf(oldName);
          users.splice(index, 1, newName);
          this.setState({users, user: newName});
      });
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

