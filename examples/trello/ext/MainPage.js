import React, { useState } from 'react'
import { Plus, X } from 'react-feather'
import classnames from 'classnames'

import { useQuery } from '@wasp/queries'
import getLists from '@wasp/queries/getLists'
import createList from '@wasp/actions/createList'
import updateList from '@wasp/actions/updateList'

import UserPageLayout from './UserPageLayout'

import waspLogo from './waspLogo.png'
import './Main.css'


const MainPage = ({ user }) => {
  const { data: lists, isFetching, error } = useQuery(getLists)

  return (
    <UserPageLayout user={user}>
      <div className='board-header'>
        <div className='board-name'>
          <h1 className='board-header-text'>Your board</h1>
        </div>
      </div>

      <div id='board'>
        { lists && <Lists lists={lists} />}
        <AddList />
      </div>

    </UserPageLayout>
  )
}

const Lists = ({ lists }) => {
    // TODO(matija): what if lists is empty? Although we make sure not to add it to dom
    // in that case.

    return lists.map((list, idx) => <List list={list} key={idx} />) 
}

const List = ({ list }) => {
  const handleListNameUpdated = async (listId, newName) => {
    await updateList({ listId, data: { name: newName } })

    try {

    } catch (err) {
      window.alert('Error while updating list name: ' + err.message)
    }
  }

  return (
    <div className='list-wrapper'>
      <div className='list'>
        <div className='list-header'>
          <textarea
            className='list-header-name mod-list-name'
            onBlur={(e) => handleListNameUpdated(list.id, e.target.value)}
            defaultValue={ list.name }
          />
        </div>
      </div>
    </div>
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
    const handleAddList = async (event) => {
      event.preventDefault()
      try {
        const listName = event.target.listName.value
        event.target.reset()
        await createList({ name: listName })
      } catch (err) {
        window.alert('Error: ' + err.message)
      }
    }

    return (
      <form onSubmit={handleAddList}>
        <input
          className='list-name-input'
          name='listName'
          type='text'
          defaultValue=''
          placeholder='Enter list title...'
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
    <div
      className={classnames(
        'add-list', 'list-wrapper', 'mod-add', { 'is-idle': !isInEditMode }
      )}
    >
      { isInEditMode ? <AddListInput /> : <AddListButton /> }
    </div>
  )
}

export default MainPage
