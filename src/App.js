import React from 'react';
import uuid from 'uuid';
import { createStore } from 'redux';

function reducer(state = {}, action) {
  return {
    activeThreadId: activeThreadReducer(state.activeThreadId, action),
    threads: threadsReducer(state.threads, action)
  }
}

function activeThreadReducer(state = '1-fca2', action) {
  if (action.type === 'OPEN_THREAD') {
    return action.id
  } else {
    return state;
  }
}

function threadsReducer(state = [
    {
      id : '1-fca2',
      title : 'Buzz Aldrin',
      messages : messagesReducer ( undefined , {}),
    },
    {
      id : '2-be91' ,
      title : 'Michael Collins' ,
      messages : messagesReducer ( undefined , {}),
    },
  ], action) {
  switch (action.type) {
    case 'ADD_MESSAGE':
    case 'DELETE_MESSAGE':
      const threadIndex = findThreadIndex(state, action);
      const oldThread = state[threadIndex];
      const newThread = {
        ...oldThread,
        messages: messagesReducer(oldThread.messages, action),
      }

      return [
        ...state.slice(0, threadIndex),
        newThread,
        ...state.slice(threadIndex + 1, state.length)
      ];
    default:
      return state;
  }
}

function findThreadIndex(threads, action) {
  switch (action.type) {
    case 'ADD_MESSAGE':
      return threads.findIndex(t => t.id === action.threadId);
    case 'DELETE_MESSAGE':
      return threads.findIndex(t => t.messages.find(m => m.id === action.id));
  }
}

function messagesReducer(state = [], action) {
  if (action.type === 'ADD_MESSAGE') {
    const newMessage = {
      id: uuid.v4(),
      text: action.text,
      timestamp: Date.now()
    }

    return state.concat(newMessage);
  } else if (action.type === 'DELETE_MESSAGE') {
    return state.filter(m => m.id !== action.id)
  } else {
    return state;
  }
}

const store = createStore(reducer);

class App extends React.Component {
  componentDidMount() {
    store.subscribe(() => this.forceUpdate());
  }

  render() {
    const state = store.getState();
    const {activeThreadId, threads} = state;
    const activeThread = threads.find(t => t.id === activeThreadId);

    return (
      <div className='ui segment'>
        <ThreadTabs tabs={tabs} />
        <Thread thread={activeThread} />
      </div>
    );
  }
}

class ThreadTabs extends React.Component {
  handleClick = (id) => {
    store.dispatch({ type: 'OPEN_THREAD', id })
  }

  componentDidMount() {
    store.subscribe(() => this.forceUpdate());
  }

  render() {
    const state = store.getState();
    const tabs = threads.map(t => ({ id: t.id, title: t.title, active: t.id === state.activeThreadId }));

    return (
      <Tabs
        tabs={tabs}
        onClick={this.handleClick}
      />
    );
  }
}

const Tabs = (props) => (
  <div className = 'ui top attached tabular menu'>
    {
      props.tabs.map((tab, index) => (
        <div
          key={index}
          className={tab.active ? 'active item' : 'item'}
          onClick={() => props.onClick(tab.id)}
        >
          {tab.title}
        </div>
      ))
    }
  </div>
)

class Thread extends React.Component {
  handleClick = (id) => {
    store.dispatch({
      type: 'DELETE_MESSAGE',
      id,
    });
  };

  render() {
    const messages = this.props.thread.messages.map((message) => (
      <div
        className='comment'
        key={message.id}
        onClick={() => this.handleClick(message.id)}
      >
        <div className="text">
          {message.text}
          <span className="metadata">@{message.timestamp}</span>
        </div>
      </div>
    ));
    return (
      <div className='ui center aligned basic segment'>
        <div className='ui comments'>
          {messages}
        </div>
        <MessageInput threadId={this.props.thread.id} />
      </div>
    );
  }
}


class MessageInput extends React.Component {
  state = {
    value: '',
  };

  onChange = (e) => {
    this.setState({
      value: e.target.value,
    })
  };

  handleSubmit = () => {
    store.dispatch({
      type: 'ADD_MESSAGE',
      text: this.state.value,
      threadId: this.props.threadId
    });
    this.setState({
      value: '',
    });
  };

  render() {
    return (
      <div className='ui input'>
        <input
          onChange={this.onChange}
          value={this.state.value}
          type='text'
        />
        <button
          onClick={this.handleSubmit}
          className='ui primary button'
          type='submit'
        >
          Submit
        </button>
       </div>
    );
  }
}

export default App;
