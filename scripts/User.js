import {key} from './keys'
import React,{Component } from 'react';
import * as SocketIO from 'socket.io-client';
import GoogleLogin from 'react-google-login';
import FacebookLogin from 'react-facebook-login';


var ReactDOM = require('react-dom');

var validUrl = require('valid-url');
var socket = SocketIO.connect();

  socket.on('connect',function() {
      
      });
  
//User class with user name and image
 class User extends React.Component {
 render() {
 return <div id="user">{this.props.name} <img id="userImage" src={this.props.src}/></div>;
 }
 }
 class Event extends React.Component{
   render() {
 return <div>
 
               <h1>{this.props.item}. {this.props.name}</h1>
               <img src={this.props.imageURL}/>
               
              <div>Venue: {this.props.venue}</div>
              <div>Location: {this.props.loc}</div>
              <a href={this.props.tickets} target='_blank'>Ticket information</a>
              <div>Date: {this.props.date} Time: {this.props.time} </div>
              
              
              
        </div>;
 }
 }
 class UserList extends React.Component {
 render() {
 const listItems = this.props.users.map((user,index) => {
   //console.log(user)
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
  componentWillUpdate: function() {
  var node = ReactDOM.findDOMNode(this);
  this.shouldScrollBottom = node.scrollTop + node.offsetHeight === node.scrollHeight;
},
 componentDidUpdate: function(){
        var node = ReactDOM.findDOMNode(this);
        node.scrollTop = node.scrollHeight;
    },

  render() {
      return (
          <div className='messages'id="messageList" >
              {
                  this.props.messages.map((message, i) => {
                  //console.log(message);
                      return (
                      
                          <Message
                              key={i}
                              user={message.user}
                              text={message.text}
                              src={message.src}
                              url={message.url}
                              img={message.img}
                              list={message.list}
                              
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
          <div className="message" id="message">
             <img id="userImage" src={this.props.src} />
              <strong>{this.props.user} :</strong> 
              {this.props.text!="" &&this.props.text!=undefined&&
              <span id="userText">{this.props.text}</span>
              }
              {console.log(this.props.url)}
              {this.props.url!=""&&this.props.url!=undefined &&
              
              <a href={this.props.url} target='_blank'>{this.props.url}</a>
              
              }
               {this.props.img!=""&&this.props.img!=undefined &&
             
              <img src={this.props.img} width="400" height="200"/>
              
              }
              {this.props.list!=undefined&&
                this.props.list.map((item, i) => {
                  //console.log(message);
                return (
                          <Event
                              key={i}
                              item={i+1}
                              date={item["date"]}      
                              imageURL={item["imageURL"]}
                              time={item["time"]}
                              name={item['title']}
                              venue={item["venue"]}
                              tickets={item["tickets"]}
                              loc={item["location"]}
                          />
                         
                   );
                  })
              }
              
             
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
          src  : this.props.src,
          url  : "",
          img  : "",
          list : undefined
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
       
    //console.log(data);
     this.state.successGoogle = (response) => {
      socket.emit("login",{'name':response["profileObj"].name,'url':response["profileObj"].imageUrl});
      this.state.show=true;
       
     }
       this.state.failureGoogle= (response) => {
          
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
      console.log(data)
      //console.log(this.state.messages+'wefefwwwwwwwwwwwwwwwwwwwwwwwwwwwww')
      if(src!='')
      {
      this.state.numberOfUsers=users.length-1;
      }
      this.setState({users, user: name,src: src});
  },

  _messageRecieve(message) {
      var {messages} = this.state;
      console.log(message["url"] +"new message");
      messages.push(message);
      this.setState({messages});
  },
  _botMessage(message)
  {
    var {messages} = this.state
     var {text,list}=message
     //console.log(list)
     //console.log(list.length)
     if (list!=undefined)
     {
     messages.push({ user: 'APPLICATION BOT',
          text : text,
          src :'http://i.imgur.com/94pZ4.gif',
          list :list
     });
     }
     else{
       messages.push({ user: 'APPLICATION BOT',
          text : text,
          src :'http://i.imgur.com/94pZ4.gif'
     });
     }
      this.setState({messages});
  },
  

  _userJoined(data) {
      var {users, messages} = this.state;
      var {name,src,show} = data;
      
      //console.log(data)
      if(show)
      {
      users.push({'name':name,'src':src});
      }
      messages.push({
          user: 'APPLICATION BOT',
          text : name +' Joined',
          src :'http://i.imgur.com/94pZ4.gif'
      });
       this.state.numberOfUsers=users.length-1;
      this.setState({users, messages},this.numberOfUsers);
  },

  _userLeft(data) {
    
      var {users, messages} = this.state;
      var {name,src} = data;
      //console.log(data + "wsefwfewfewfewfwelijfioewajfjowejfo")
      var index = users.indexOf({'name':name,src: 'src'});
      users.splice(index, 1);
      messages.push({
          user: 'APPLICATION BOT',
          text : name +' Left',
          src :'http://i.imgur.com/94pZ4.gif'
      });
      this.state.numberOfUsers=users.length-1
      this.setState({users, messages},this.numberOfUsers);
  },



  handleMessageSubmit(message) {
      var {messages} = this.state;
      var audio = document.getElementById("audio");
      audio.play();
      /*
      if (validUrl.isUri(message.text)){
        console.log(message.text);
        if(message.text.match(/\.(jpeg|jpg|gif|png)$/) != null)
        {
          console.log('image');
          message.img=message.text
        }
        else{
          console.log('not an image');
          message.url=message.text
        }
        
      } else {
        console.log(message.text);
      }
      
      messages.push(message);
      this.setState({messages});
      //console.log(message.text)
      */
      socket.emit('send:message', message);
      if (message.text.includes("!!"))
      {
        socket.emit('bot',message)
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
          buttonStyle={ { fontSize: 12 } }
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
    //console.log(this.state.fetchedData);
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
