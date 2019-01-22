import React, { Component } from 'react';

class Home extends Component {
  render() {
    const isLoggedIn = this.props.userInfo !== null;
    return (
      <div>
        <div>Home</div>
        <div>
          {isLoggedIn ? (
            <div>You are logged in</div>
          ) : (
            <div>You are not logged in</div>
          )}
        </div>
      </div>
    );
  }
}

export default Home;