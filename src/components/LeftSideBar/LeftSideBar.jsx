import React, { useContext, useEffect, useRef, useState } from 'react';
import "./LeftSideBar.css";
import assets from '../../assets/assets';
import { useNavigate } from 'react-router-dom';
import { arrayUnion, collection, doc, getDoc, getDocs, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';
import { logout } from '../../config/firebase'

const LeftSideBar = () => {
    const navigate = useNavigate();
    const { userData,chatUser, chatData, setChatUser, messagesId,setMessagesId ,chatVisible , setChatVisible,profiletVisible,setProfileVisible } = useContext(AppContext);
    const [user, setUser] = useState(null);
    const [showSearch, setShowSearch] = useState(false);

    const inputHandler = async (e) => {
        const input = e.target.value;
        try {
            
                setShowSearch(true);

                // Fetch users matching the input
                const userRef = collection(db, 'users');
                const q = query(userRef, where("username", "==", input.toLowerCase()));
                const querySnap = await getDocs(q);

                

                if (!querySnap.empty) {
                    console.log('Search result:', querySnap.docs[0].data());
                    const firstDocData = querySnap.docs[0]?.data();
                    
                    // Ensure the user found is not the current user
                    if (firstDocData && firstDocData.id !== userData.id) {
                        let userExist = false;

                        // Check if the user already exists in the chatData
                        chatData.forEach((chat) => {
                            if (chat.rId === firstDocData.id) {
                                userExist = true;
                            }
                        });

                        // If user doesn't exist, set the user data for chat addition
                        if (!userExist) {
                            setUser(firstDocData);
                            console.log('User found:', firstDocData);
                        } else {
                            setUser(null);
                            console.log('User already exists in chat');
                        }
                    } else {
                        setUser(null);
                        console.log('No valid user found or user is the current user');
                    }
                } else {
                    setUser(null);
                    console.log('No user found');
                }
            
        } catch (error) {
            console.error('Error in inputHandler:', error);
        }
    };

    const addChat = async () => {
        const messagesRef = collection(db, "messages");
        const chatsRef = collection(db, "chats");

        try {
            // Create a new message document
            const newMessageRef = doc(messagesRef);
            await setDoc(newMessageRef, {
                createAt: serverTimestamp(),
                messages: []
            });

            // Add chat data for the selected user and current user
            await updateDoc(doc(chatsRef, user.id), {
                chatsData: arrayUnion({
                    messageId: newMessageRef.id,
                    lastMessage: "",
                    rId: userData.id,
                    updatedAt: Date.now(),
                    messageSeen: true
                })
            });

            await updateDoc(doc(chatsRef, userData.id), {
                chatsData: arrayUnion({
                    messageId: newMessageRef.id,
                    lastMessage: "",
                    rId: user.id,
                    updatedAt: Date.now(),
                    messageSeen: true
                })
            });

            const uSnap = await getDoc(doc(db,"users",user.id))
            const uData = uSnap.data();
            setChat({
                messagesId:newMessageRef.id,
                lastMessage:"",
                rId:user.id,
                updatedAt:Date.now(),
                messageSeen:true,
                userData:uData
            })
            setShowSearch(false)
            setChatVisible(true)
            toast.success('Chat added successfully')
            console.log('Chat added successfully');
        } catch (error) {
            console.error('Error adding chat:', error);
        }
    };

    const setChat = async (item) => {
        try {
            setMessagesId(item.messageId);
        setChatUser(item);
        const userChatsref = doc(db,"chats",userData.id);
        const userChatsSnapshot = await getDoc(userChatsref)
        const userChatsData = userChatsSnapshot.data();
        const chatIndex = userChatsData.chatsData.findIndex((c)=>c.messageId===item.messageId);
        userChatsData.chatsData[chatIndex].messageSeen=true;
        await updateDoc(userChatsref,{
            chatsData:userChatsData.chatsData
        })
        setChatVisible(true)
        } catch (error) {
            
        }
        
    }; 

    useEffect(()=>{
        const updateChatUserData = async ()=>{
            if (chatUser) {
                const userRef = doc(db,"users",chatUser.userData.id)
                const userSnap = await getDoc(userRef);
                const userData = userSnap.data();
                setChatUser(prev=>({...prev,userData:userData}))
            }
        }
        updateChatUserData();
    },[chatData])

    return (
        <div className={`ls ${chatVisible||profiletVisible?"hidden":""}`}>
            <div className="ls-top">
                <div className="ls-nav">
                    <img src={assets.logo} className='logo' alt="Logo" />
                    <div className="menu">
                        <img src={assets.menu_icon} alt="Menu Icon" />
                        <div className="sub-menu">
                            <p onClick={() => navigate("/profile")}>Edit profile</p>
                            <hr />
                            <p onClick={()=>logout()}>Logout</p>
                        </div>
                    </div>
                </div>
                <div className="ls-search">
                    <img src={assets.search_icon} alt="Search Icon" />
                    <input onChange={inputHandler} type="text" placeholder='Search here...' />
                </div>
            </div>
            <div className="ls-list">
                {showSearch && user ? (
                    <div onClick={addChat} className='friends add-user'>
                        <img src={user.avatar} alt="User Avatar" />
                        <p>{user.name}</p>
                    </div>
                ) : (
                    chatData.map((item, index) => (
                        <div onClick={() => setChat(item)} key={index} className={`friends ${item.messageSeen || item.messageId === messagesId?"":"border"}`}>
                            <img src={item.userData.avatar} alt="User" />
                            <div>
                                <p>{item.userData.name}</p>
                                <span>{item.lastMessage}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default LeftSideBar;
