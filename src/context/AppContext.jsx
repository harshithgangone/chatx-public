import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { createContext, useEffect, useState } from "react";
import { auth, db } from "../config/firebase";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const AppContext = createContext();

const AppContextProvider = (props) => {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [chatData, setChatData] = useState(null);
    const [messagesId, setMessagesId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [chatUser, setChatUser] = useState(null);
    const [chatVisible,setChatVisible]= useState(false)
    const [profileVisible,setProfileVisible]= useState(false)

    // Load user data and handle navigation based on profile completeness
    const loadUserData = async (uid) => {
        if (!uid) {
            console.error("User ID is undefined.");
            return;
        }

        try {
            const userRef = doc(db, "users", uid);
            const userSnap = await getDoc(userRef);

            // Check if userSnap exists and has data
            if (userSnap.exists()) {
                setInterval(async () => {
                    if (auth.chatUser) {
                        await updateDoc(userRef, {
                            lastSeen: Date.now(),
                        });
                    }
                }, 60000);
                const userData = userSnap.data();
                setUserData(userData);

                // Navigate to chat or profile based on avatar and name
                if (userData.avatar && userData.name) {
                    navigate("/chat");
                } else {
                    navigate("/profile");
                }

                // Update lastSeen every 6 seconds if user is logged in
                await updateDoc(userRef,{
                    lastSeen:Date.now()
                })
                

                

            } else {
                toast.error("User Data does not exist.");
                    navigate("/")
            }
        } catch (error) {
            console.error("Error loading user data: ", error);
        }
    };

    // Fetch chat data for the current user
    
    useEffect(() => {
        if (userData && userData.id) {
            const chatRef = doc(db, "chats", userData.id);

            // Subscribe to chat updates using onSnapshot
            const unSub = onSnapshot(chatRef, async (res) => {
                if (res.exists()) {
                    const chatItems = res.data()?.chatsData || [];
                    
                    // Log chatItems for debugging
                    console.log("Chat Items: ", chatItems);

                    const tempData = [];

                    // Loop through each chat item and fetch related user data
                    for (const item of chatItems) {
                        if (!item.rId) {
                            console.error("Recipient ID is undefined for item: ", item);
                            continue; // Skip this item if rId is not defined
                        }

                        const userRef = doc(db, 'users', item.rId);
                        const userSnap = await getDoc(userRef);

                        // Add user data to chat item
                        if (userSnap.exists()) {
                            const userData = userSnap.data();
                            tempData.push({ ...item, userData });
                        } else {
                            console.error(`User with rId ${item.rId} not found.`);
                        }
                    }

                    // Sort chat data by updatedAt and set it to state
                    setChatData(tempData.sort((a, b) => b.updatedAt - a.updatedAt));
                } else {
                    toast.error("Chat document does not exist.");
                    navigate("/")
                }
            });

            // Clean up the onSnapshot subscription on component unmount
            return () => {
                unSub();
            };
        } else {
            console.warn("userData or userData.id is undefined.");
        }
    }, [userData]);

    // Context value to pass down to components
    const value = {
        userData, setUserData,
        chatData, setChatData,
        loadUserData,
        messages, setMessages,
        messagesId, setMessagesId,
        chatUser, setChatUser,
        chatVisible,setChatVisible,
        profileVisible,setProfileVisible
    };

    // Return the AppContext provider with children
    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;
