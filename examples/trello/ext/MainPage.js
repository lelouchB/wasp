import React, { useState } from 'react'
import { Plus, X, MoreHorizontal } from 'react-feather'
import { Popover } from 'react-tiny-popover'
import classnames from 'classnames'

import { useQuery } from '@wasp/queries'
import getLists from '@wasp/queries/getLists'
import createList from '@wasp/actions/createList'
import updateList from '@wasp/actions/updateList'
import deleteList from '@wasp/actions/deleteList'

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

    return lists.map((list) => <List list={list} key={list.id} />) 
}

const List = ({ list }) => {
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const handleListNameUpdated = async (listId, newName) => {
    try {
      await updateList({ listId, data: { name: newName } })
    } catch (err) {
      window.alert('Error while updating list name: ' + err.message)
    }
  }

  const handleDeleteList = async (listId) => {
    try {
      await deleteList({ listId })
    } catch (err) {
      window.alert('Error while deleting list: ' + err.message)
    }
    setIsPopoverOpen(false)
  }

  const ListMenu = () => {
    return (
      <div className='popover-menu'>
        <div className='popover-header'>
          <div className='popover-header-item'>
            <button className='popover-header-close-btn dark-hover fake-invisible-item'><X size={16}/></button>
          </div>
          <span className='popover-header-title popover-header-item'>List&nbsp;actions</span>
          <div className='popover-header-item'>
            <button
              className='popover-header-close-btn dark-hover'
              onClick={() => setIsPopoverOpen(false)}
            >
              <X size={16}/>
            </button>
          </div>
        </div>
        <div className='popover-content'>
          <ul className='popover-content-list'>
            <li><button>Add card...</button></li>
            <li><button>Copy list...</button></li>
            <li>
              <button onClick={() => handleDeleteList(list.id)}>
                Delete this list
              </button>
            </li>
          </ul>
        </div>
      </div>
    )
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
          <div className='list-header-extras'>
            <Popover
              isOpen={isPopoverOpen}
              onClickOutside={() => setIsPopoverOpen(false)}
              positions={['bottom', 'right', 'left']}
              align='start'
              padding={6}
              content={<ListMenu/>}
            >
              <div
                className='list-header-extras-menu dark-hover'
                onClick={() => setIsPopoverOpen(!isPopoverOpen)}
              >
                <MoreHorizontal size={16}/>
              </div>
            </Popover>
          </div>
        </div> {/* eof list-header */}
        <div className='list-cards'>
        </div>
        <div className='card-composer-container'>
          <AddCard />
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
          <div className='add-icon'>
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
            <X/>
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

const AddCard = () => {

  const AddCardButton = () => {
    return (
      <button className='open-card-composer dark-hover'>
        <div className='add-icon'>
          <Plus size={16} strokeWidth={2} />
        </div>
        Add a card
      </button>
    )
  }

  return (
    <div>
      <AddCardButton />
    </div>
  )
}

export default MainPage
