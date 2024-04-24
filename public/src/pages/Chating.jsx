import React, { useState, useEffect ,useRef} from 'react';
import axios from 'axios';
import styled from 'styled-components';
import Contact from '../components/Contacts';
import { useNavigate } from 'react-router-dom';
import { allUsersRoute } from '../utils/APIRoutes';
import Welcome from '../components/Welcome';
import ChatContainer from '../components/ChatContainer';
import {io} from "socket.io-client";
const host = 'http://localhost:3000'; 
export default function Chating() {
  const socket=useRef();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [isLoaded,setIsLoaded]=useState(false);
  useEffect(() => {
    const checkUserLoggedIn = async () => {
      if (!localStorage.getItem('chat-app-users')) {
        navigate('/login');
      } else {
        setCurrentUser(await JSON.parse(localStorage.getItem('chat-app-users')));
        setIsLoaded(true);
      }
    };
    checkUserLoggedIn();
  }, []);
  useEffect(() => {
    if (currentUser) {
      socket.current = io(host);
      socket.current.emit("add-user", currentUser._id);
    }
  }, [currentUser]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (currentUser && currentUser.isAvatarImageSet) {
          const { data } = await axios.get(`${allUsersRoute}/${currentUser._id}`);
          setContacts(data);
        } else {
          navigate('/setAvatar');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Handle any errors here
      }
    };

    if (currentUser) {
      fetchData();
    }

    // Cleanup function
    return () => {
      // Perform any cleanup here if necessary
    };
  }, [currentUser]);

  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };

  return (
    <Container>
     
        <div className="container">
          
          
              <Contact contacts={contacts} currentUser={currentUser} changeChat={handleChatChange} />
              {isLoaded && currentChat===undefined ?(
              <Welcome currentUser={currentUser} />
              ) :(
               <ChatContainer currentChat={currentChat} currentUser={currentUser} socket={socket}/>
              )
              }
        </div>
    </Container>
  );
}

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #131324;

  .container {
    height: 85vh;
    width: 85vw;
    background-color: #00000076;
    display: grid;
    grid-template-columns: 25% 75%;

    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
  }
`;
