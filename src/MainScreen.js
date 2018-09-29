import React, { Component } from 'react';
import firebase, { auth } from './firebase.js';
import './App.css';
import { Button, Image } from 'react-bootstrap';

import SideNav, { Nav, NavIcon, NavText } from 'react-sidenav';
import SvgIcon from 'react-icons-kit';

import { ic_assignment } from 'react-icons-kit/md/ic_assignment';
import { ic_business } from 'react-icons-kit/md/ic_business';

export default class MainScreen extends Component {
  constructor(props){
    super(props);
    this.state = {
    }
  }

  render() {
    return(
      <div style={{background: '#2c3e50', color: '#FFF', width: 220}}>
        <SideNav highlightColor='#E91E63' highlightBgColor='#00bcd4' defaultSelected='sales'>

          <div className='user-profile'>
            <Image src={auth.currentUser.photoURL} circle /><br />
            {auth.currentUser.displayName}<br />
            <Button onClick={this.props.app.logOut}>Log Out</Button>
          </div>
            <Nav id='dashboard'>
                <NavIcon><SvgIcon size={20} icon={ic_assignment}/></NavIcon>
                <NavText> Dashboard </NavText>
            </Nav>
            <Nav id='sales'>
                <NavIcon><SvgIcon size={20} icon={ic_business}/></NavIcon>
                <NavText> Sales </NavText>
            </Nav>
        </SideNav>
    </div>
  )
  }
}
