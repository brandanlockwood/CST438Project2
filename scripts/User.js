import {key} from './keys'
import React,{Component } from 'react';
import * as SocketIO from 'socket.io-client';
import GoogleLogin from 'react-google-login';
import FacebookLogin from 'react-facebook-login';




var socket = SocketIO.connect();

  socket.on('connect',function() {
      
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
 <ul>{listItems}</ul>
 </div>
 );
 }
}
//Message List 
var MessageList = React.createClass({
  render() {
      return (
          <div className='messages'id="messageList">
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
//Message Component includes picture,user name,text
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
           
              <form onSubmit={this.handleSubmit}>
              CHAT:<input
                      
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
      return {users: [], messages:[], text: '',failureGoogle:[],successGoogle:[],numberOfUsers:0,show:false};
  },

  componentDidMount() {
     
     
      socket.on('login',this._login);
      socket.on('init', this._initialize);
      socket.on('send:message', this._messageRecieve);
      socket.on('user:join', this._userJoined);
      socket.on('user:left', this._userLeft);
      socket.on('bot',this._botMessage);
      socket.on('disconnect',function(){
        
      });
  },

  _login(data)
  {
       
    console.log(data);
     this.state.successGoogle = (response) => {
       
      //console.log(response);
      //console.log(response["profileObj"].imageUrl);
      //console.log(response["profileObj"].name);
      socket.emit("login",{'name':response["profileObj"].name,'url':response["profileObj"].imageUrl});
      this.state.show=true;
       
     }
       this.state.failureGoogle= (response) => {
          
          console.error(response)
          }
          
          
         this.state.responseFacebook = (response) => {
           if(response["accessToken"]!=undefined)
           {
           socket.emit("facebookLogin",response["accessToken"])
           this.state.show=true;
           }
         };

        
    
  },
  _initialize(data) {
      var {users, name,src,messages} = data;
      this.state.messages=messages;
      console.log(this.state.messages+'wefefwwwwwwwwwwwwwwwwwwwwwwwwwwwww')
      if(src!='')
      {
      this.state.numberOfUsers=users.length-1;
      }
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
          src :'http://vignette4.wikia.nocookie.net/scribblenauts/images/b/b3/Robot_Female.png/revision/latest?cb=20130119185217'});
      this.setState({messages});
  },

  _userJoined(data) {
      var {users, messages} = this.state;
      var {name,src} = data;
      
      console.log(data)
      users.push({'name':name,'src':src});
      messages.push({
          user: 'APPLICATION BOT',
          text : name +' Joined',
          src :'http://vignette4.wikia.nocookie.net/scribblenauts/images/b/b3/Robot_Female.png/revision/latest?cb=20130119185217'
      });
       this.state.numberOfUsers=users.length-1;
      this.setState({users, messages},this.numberOfUsers);
  },

  _userLeft(data) {
    
      var {users, messages} = this.state;
      var {name,src} = data;
      console.log(data + "wsefwfewfewfewfwelijfioewajfjowejfo")
      var index = users.indexOf({'name':name,src: 'src'});
      users.splice(index, 1);
      messages.push({
          user: 'APPLICATION BOT',
          text : name +' Left',
          src :'http://vignette4.wikia.nocookie.net/scribblenauts/images/b/b3/Robot_Female.png/revision/latest?cb=20130119185217'
      });
      this.state.numberOfUsers=users.length-1
      this.setState({users, messages},this.numberOfUsers);
  },



  handleMessageSubmit(message) {
      var {messages} = this.state;
      messages.push(message);
      this.setState({messages});
     console.log(message.text)
      socket.emit('send:message', message);
      if(message.text.includes("!! about"))
      {
        socket.emit('bot',"This room is for authorized potatos only");
      }else if(message.text.includes("!! help"))
      {
        socket.emit('bot',"!! about -gives description of room\n"
        +"!! help -gives all commands of the room\n"
        +"!! say <something> -makes me say <something>\n"
        +"!! chatBot <somethign> -say something to chatterbot \n"
        +"!! smile -to make bot a little happier");
      }
      else if(message.text.includes("!! say"))
      {
        var text = message.text.replace("!! say","");
        socket.emit('bot',text);
      }else if (message.text.includes("!! smile"))
      {
        socket.emit('bot',"=]");
        
      }else if(message.text.includes("!! chatBot"))
      {
        socket.emit('bot',message.text);
      }else if(message.text.includes("!!"))
      {
        socket.emit('bot',"Sorry I didn't get that");
      }
      
      
  },

  

  render() {
      return (
       
          <div>
          {this.state.show ? (
         <div>
              <div id="onlineUsers"  >
              <h2>Online Users {this.state.numberOfUsers}</h2>
              </div>
              <UserList
                  users={this.state.users}
              />
               <div id="messageHeader" >  <h2> Conversation: </h2></div>
              <MessageList
                  messages={this.state.messages}
              />
              <MessageForm
                  onMessageSubmit={this.handleMessageSubmit}
                  user={this.state.user}
                  src={this.state.src}
              />
       </div>
          ):(
     
            <div  id="Login">
           
    

            <h2>Login</h2>
             
             <FacebookLogin
          appId="101547387036328"
          autoLoad
          buttonStyle={ { fontSize: 40 } }
          callback={this.state.responseFacebook}
         
        />

            <h2> </h2>
          <GoogleLogin
            clientId={key}
            buttonText="Login"
            onSuccess={this.state.successGoogle}
            onFailure={this.state.failureGoogle}
            />
       </div>
          )
          }
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
          fetchedData: 'http://media.gettyimages.com/photos/-id171153429'

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
    
       <ChatApp />
        <GiveMeACat />
      </div>
    );
  }
}
