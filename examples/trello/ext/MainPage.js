import React, { useState } from 'react'
import { Plus, X } from 'react-feather'

import UserPageLayout from './UserPageLayout'

import waspLogo from './waspLogo.png'
import './Main.css'


const MainPage = ({ user }) => {
  return (
    <UserPageLayout user={user}>
      <span>This is the beginning of our new Trello app - Waspello.</span>

      <div id='board'>
        <AddList />
      </div>

    </UserPageLayout>
  )
}

const AddList = () => {

    const [isInEditMode, setIsInEditMode] = useState(false)

    const AddListButton = () => {
      return (
        <button
          className='open-add-list'
          onClick={() => setIsInEditMode(true)}
        >
            <div className='add-list-icon'>
              <Plus size={16} strokeWidth={2} />
            </div>
            Add a list
        </button>
      )
    }

    const AddListInput = () => {
      const [titleFieldVal, setTitleFieldVal] = useState('')

      const handleAddList = async (event) => {
        event.preventDefault()
        // Do API call.
      }

      return (
        <form onSubmit={handleAddList}>
          <input
            className="list-name-input"
            type="text"
            placeholder="Enter list title..."
            value={titleFieldVal}
            onChange={e => setTitleFieldVal(e.target.value)}
          />
          <div className='list-add-controls'>
            <input className='list-add-button' type='submit' value='Add list' />
            <div
              className='list-cancel-edit'
              onClick={() => setIsInEditMode(false)}
            >
              <X  />
            </div>
          </div>
        </form>
      )
    }

    return (
      <div className='add-list list-wrapper'>
        { isInEditMode ? <AddListInput /> : <AddListButton /> }
      </div>
    )

}

export default MainPage
