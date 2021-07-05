import React from 'react'
import { Link } from 'react-router-dom'

import SignupForm from '@wasp/auth/forms/Signup'

import mainLogo from './waspello-logo.png'
import './Signup.css'

const SignupPage = (props) => {
  return (
    <div class="signup-top-container">

      <img alt="Waspello" class="main-logo" src={mainLogo} />

      <div class="signup-form-container">
        <SignupForm/>
        <p>
          I already have an account (<Link to="/login">go to login</Link>).
        </p>
      </div>

    </div>
  )
}

export default SignupPage
