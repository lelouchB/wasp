import React, { useState, useRef } from 'react'
import { Plus, X, MoreHorizontal } from 'react-feather'
import { Popover } from 'react-tiny-popover'
import classnames from 'classnames'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

import { useQuery } from '@wasp/queries'
import getLists from '@wasp/queries/getLists'
import createList from '@wasp/actions/createList'
import updateList from '@wasp/actions/updateList'
import deleteList from '@wasp/actions/deleteList'

import getCards from '@wasp/queries/getCards'
import createCard from '@wasp/actions/createCard'

import UserPageLayout from './UserPageLayout'

import waspLogo from './waspLogo.png'
import './Main.css'


// TODO(matija): rename to more general name.
const DND_ITEM_POS_SPACING = 2 ** 16

// It is expected that each item has .pos property.
const calcNewDndItemPos = (items) => {
  if (!Array.isArray(items) || items.length === 0) return DND_ITEM_POS_SPACING - 1;

  return Math.max(...items.map(l => l.pos)) + DND_ITEM_POS_SPACING
}

// It is assummed that lists is sorted by pos, ascending.
const calcMovedListPos = (lists, src, dest) => {
  if (src === dest) return lists[src].pos
  if (dest === 0) return (lists[0].pos / 2)
  if (dest === lists.length - 1) return lists[lists.length - 1].pos + DND_ITEM_POS_SPACING

  if (dest > src) return (lists[dest].pos + lists[dest + 1].pos) / 2
  if (dest < src) return (lists[dest - 1].pos + lists[dest].pos) / 2
}

const MainPage = ({ user }) => {
  const { data: lists, isFetching, error } = useQuery(getLists)

  // NOTE(matija): this is only a shallow copy.
  const listsSortedByPos = lists && [...lists].sort((a, b) => a.pos - b.pos)

  const onDragEnd = async (result) => {
    // Dropped outside the list (of lists).
    if (!result.destination) {
      return
    }
    const newPos =
      calcMovedListPos(listsSortedByPos, result.source.index, result.destination.index)

    // Call a db action that updates the pos of the affected list.
    try {
      const movedListId = listsSortedByPos[result.source.index].id
      await updateList({ listId: movedListId, data: { pos: newPos } })
    } catch (err) {
      window.alert('Error while updating list position: ' + err.message)
    }
  }

  return (
    <UserPageLayout user={user}>
      <div className='board-header'>
        <div className='board-name'>
          <h1 className='board-header-text'>Your board</h1>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable" direction="horizontal">
          {(provided, snapshot) => (
            <div id='board' className='u-fancy-scrollbar'
              ref={provided.innerRef}
              {...provided.droppableProps}
            >
              { listsSortedByPos && <Lists lists={listsSortedByPos} /> }
              {provided.placeholder}
              <AddList newPos={calcNewDndItemPos(lists)} />
            </div>
          )}
        </Droppable>
      </DragDropContext>

    </UserPageLayout>
  )
}

const Lists = ({ lists }) => {
    // TODO(matija): what if lists is empty? Although we make sure not to add it to DOM
    // in that case.

    return lists.map((list, index) => (
      <List list={list} key={list.id} index={index} />
    )) 
}

const List = ({ list, index }) => {
  const { data: cards, isFetching, error } = useQuery(getCards, { listId: list.id })

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
    <Draggable
      key={list.id}
      draggableId={`dragItem-${list.id}`}
      index={index}
    >
      {(provided, snapshot) => (
        <div className='list-wrapper'
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >

          <Droppable droppableId={`list-dropArea-${list.id}`} direction="vertical">
            {(provided, snapshot) => (
              <div className='list'
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
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


                { cards && <Cards cards={cards} /> }

                <div className='card-composer-container'>
                  <AddCard listId={list.id} newPos={calcNewDndItemPos(cards)} />
                </div>

              </div>
            )}
          </Droppable>

        </div>
      )}
    </Draggable>
  )
}

const Cards = ({ cards }) => {
  return (
    <div className='list-cards'>
      { cards.map((card) => <Card card={card} key={card.id} />) }
    </div>
  )
}

const Card = ({ card }) => {
  return (
    <div className='list-card'>
      <span className='list-card-title'>{ card.title }</span>
    </div>
  )
}

const AddList = ({ newPos }) => {
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
        await createList({ name: listName, pos: newPos })
      } catch (err) {
        window.alert('Error: ' + err.message)
      }
    }

    return (
      <form onSubmit={handleAddList}>
        <input
          className='list-name-input'
          autoFocus
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

const AddCard = ({ listId, newPos }) => {
  const [isInEditMode, setIsInEditMode] = useState(false)

  const AddCardButton = () => {
    return (
      <button
        className='open-card-composer dark-hover'
        onClick={() => setIsInEditMode(true)}
      >
        <div className='add-icon'>
          <Plus size={16} strokeWidth={2} />
        </div>
        Add a card
      </button>
    )
  }

  const AddCardInput = ({ listId }) => {
    const formRef = useRef(null)

    const submitOnEnter = (e) => {
      if (e.keyCode === 13 /* && e.shiftKey == false */) {
        e.preventDefault()

        formRef.current.dispatchEvent(
          new Event('submit', { cancelable: true, bubbles: true })
        )
      }
    }

    const handleAddCard = async (event, listId) => {
      event.preventDefault()
      try {
        const cardTitle = event.target.cardTitle.value
        event.target.reset()
        await createCard({ title: cardTitle, pos: newPos, listId })
      } catch (err) {
        window.alert('Error: ' + err.message)
      }
    }

    return (
      <form className='card-composer' ref={formRef} onSubmit={(e) => handleAddCard(e, listId)}>
        <div className='list-card'>
          <textarea
            className='card-composer-textarea'
            onKeyDown={submitOnEnter}
            autoFocus
            name='cardTitle'
            placeholder='Enter a title for this card...'
          />
        </div>
        <div className='card-add-controls'>
          <input className='card-add-button' type='submit' value='Add card' />
          <div
            className='card-cancel-edit'
            onClick={() => setIsInEditMode(false)}
          >
            <X/>
          </div>
        </div>
      </form>
    )

  }

  return (
    <div>
      { isInEditMode ? <AddCardInput listId={listId} /> : <AddCardButton /> }
    </div>
  )
}

export default MainPage
