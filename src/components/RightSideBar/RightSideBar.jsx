import React, { useContext, useEffect, useState } from 'react'
import "./RightSideBar.css"
import assets from '../../assets/assets'
import { logout } from '../../config/firebase'
import { AppContext } from '../../context/AppContext'

const RightSideBar = () => {
  const { chatUser, messages,profileVisible,setProfileVisible } = useContext(AppContext);
  const [msgImages, setMsgImages] = useState([]);

  useEffect(() => {
    let tempVar = [];
    messages.forEach((msg) => {
      if (msg.image) {
        tempVar.push(msg.image);
      }
    });
    setMsgImages(tempVar);
  }, [messages]);

  // Debugging: Ensure lastSeen is defined and correct
  console.log("Last Seen:", chatUser?.userData?.lastSeen);
  console.log("Current Time:", Date.now());

  const isOnline = chatUser && chatUser.userData?.lastSeen && (Date.now() - chatUser.userData.lastSeen <= 70000);
  console.log(isOnline);
  
  return chatUser ? (
    <div className={`rs ${profileVisible ? "" : "hidden"}`}>
       <img onClick={()=>setProfileVisible(false)} src={assets.arrow_icon} className='arrow' alt="" />
      <div className="rs-profile">
        <div className="sub-profile">
          
           <img className='avatar' src={chatUser.userData.avatar} alt="user" />
            <h3>
               {isOnline ? <img className="dot" src={assets.green_dot} alt="Online" /> : null}
               {chatUser.userData.name}
           </h3>
        </div>
      
        <p>{chatUser.userData.bio}</p>
      </div>
      <hr />
      <div className="rs-media">
        <p>Media</p>
        <div>
          {msgImages && msgImages.length > 0 ? (
            msgImages.map((url, index) => (
              <img onClick={() => window.open(url)} key={index} src={url} alt={`media-${index}`} />
            ))
          ) : (
            <p className="no-media">---</p>
          )}
        <button onClick={() => logout()}>Logout</button>
        </div>
        
      </div>
    </div>
  ) : (
    <div className="rs start">
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
};

export default RightSideBar;
