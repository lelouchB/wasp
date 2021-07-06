import React from 'react'
import waspLogo from './waspLogo.png'
import './Main.css'

import UserPageLayout from './UserPageLayout'

const MainPage = ({ user }) => {
  return (
    <UserPageLayout user={user}>
      <span>This is the beginning of our new Trello app - Waspello.</span>
    </UserPageLayout>
  )
}
export default MainPage
