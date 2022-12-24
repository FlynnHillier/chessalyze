import React from 'react'
import "./../../styles/connectivity/StatusInterface.css"
import SmoothLoadingSpan from '../loading/SmoothLoadingSpan'
import {RiFileCopyLine} from "react-icons/ri"

const ConnectivityStatusInterface = () => {
  return (
    <div className="connectivity status-interface-container">
       <div className='status-header'>
          <h1>
            status
          </h1>
       </div>
      <div className="status-players">
        <div className="status-players-playertag">
            player one
        </div>
        <div className="status-players-playertag">
          player two
        </div>
      </div>
      <div className="status-button-container">
        <button><SmoothLoadingSpan/></button>
      </div>
      <div className="status-paste-field-container">
          <div>
              <RiFileCopyLine/>
          </div>
          <div>
              copy invite link
          </div>
      </div>
    </div>
  )
}

export default ConnectivityStatusInterface