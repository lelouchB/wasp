import React from 'react'
import { Plus } from 'react-feather'

import UserPageLayout from './UserPageLayout'

import waspLogo from './waspLogo.png'
import './Main.css'


const MainPage = ({ user }) => {
  return (
    <UserPageLayout user={user}>
      <span>This is the beginning of our new Trello app - Waspello.</span>

      <div id='board'>

        <div className='add-list list-wrapper'>
          <button className='open-add-list'>
              <div className='add-list-icon'>
                <Plus size={16} strokeWidth={2} />
              </div>
              Add a list
          </button>
        </div>

      </div>

    </UserPageLayout>
  )
}

export default MainPage
