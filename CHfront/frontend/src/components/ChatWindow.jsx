import { useState, useEffect, useContext, useRef } from "react";
import axios from "axios";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import { SocketContext } from "../context/SocketContext";
import Picker from "emoji-picker-react";

import {
  Box,
  Paper,
  IconButton,
  TextField,
  Typography,
  Avatar
} from "@mui/material";

import SendIcon from "@mui/icons-material/Send";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import AttachFileIcon from "@mui/icons-material/AttachFile";

export default function ChatWindow({ selectedChat, setSelectedChat, user }) {

  const { socket } = useContext(SocketContext);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const bottomRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  /* ================= FETCH MESSAGES ================= */

  useEffect(() => {

    if (!selectedChat || !user?.token) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {

      try {

        const { data } = await axios.get(
          `http://localhost:5000/api/messages/${selectedChat._id}`,
          { headers: { Authorization: `Bearer ${user.token}` } }
        );

        setMessages(data);

      } catch (err) {
        console.error(err.response?.data || err.message);
      }

    };

    fetchMessages();

    if (socket) socket.emit("join_chat", selectedChat._id);

  }, [selectedChat?._id, user?.token, socket]);

  /* ================= SOCKET LISTENERS ================= */

  useEffect(() => {

    if (!socket) return;

    const handleReceive = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const handleTyping = () => setTyping(true);
    const handleStopTyping = () => setTyping(false);

    socket.on("receive_message", handleReceive);
    socket.on("typing", handleTyping);
    socket.on("stop_typing", handleStopTyping);

    return () => {
      socket.off("receive_message", handleReceive);
      socket.off("typing", handleTyping);
      socket.off("stop_typing", handleStopTyping);
    };

  }, [socket]);

  /* ================= AUTO SCROLL ================= */

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  /* ================= SEND MESSAGE ================= */

  const sendMessage = async (content = text) => {

    if (!content.trim() || !selectedChat) return;

    const tempMessage = {
      _id: Date.now(),
      content,
      sender: user,
      chat: selectedChat._id,
      createdAt: new Date(),
      isTemp: true
    };

    setMessages((prev) => [...prev, tempMessage]);
    setText("");

    try {

      const { data } = await axios.post(
        "http://localhost:5000/api/messages",
        { content, chatId: selectedChat._id },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setMessages((prev) =>
        prev.map((msg) => (msg._id === tempMessage._id ? data : msg))
      );

    } catch (err) {
      console.error(err.response?.data || err.message);
    }

  };

  /* ================= FILE UPLOAD ================= */

  const handleFileUpload = async (file) => {

    if (!file || !selectedChat) return;

    const formData = new FormData();
    formData.append("file", file);

    try {

      const { data } = await axios.post(
        "http://localhost:5000/api/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
            "Content-Type": "multipart/form-data"
          }
        }
      );

      const tempFileMessage = {
        _id: Date.now(),
        content: data.file,
        sender: user,
        chat: selectedChat._id,
        createdAt: new Date(),
        isTemp: true
      };

      setMessages((prev) => [...prev, tempFileMessage]);

      const res = await axios.post(
        "http://localhost:5000/api/messages",
        { content: data.file, chatId: selectedChat._id },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setMessages((prev) =>
        prev.map((msg) => (msg._id === tempFileMessage._id ? res.data : msg))
      );

    } catch (err) {
      console.error(err.response?.data || err.message);
    }

  };

  /* ================= TYPING EVENTS ================= */

  const handleTypingEvent = () => {

    if (!socket || !selectedChat) return;

    socket.emit("typing", selectedChat._id);

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", selectedChat._id);
    }, 2000);

  };

  /* ================= EMOJI PICKER ================= */

  const onEmojiClick = (emojiObject) => {
    setText((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  return (

    <Box
      sx={{
        width: "66%",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "linear-gradient(135deg,#eef2ff,#f9fafb)"
      }}
    >

      {/* Header */}

      <Paper
        elevation={4}
        sx={{
          p:2,
          display:"flex",
          alignItems:"center",
          gap:2,
          backdropFilter:"blur(10px)",
          background:"linear-gradient(90deg,#6366f1,#3b82f6)",
          color:"white",
          borderBottomLeftRadius:20,
          borderBottomRightRadius:20
        }}
      >

        <Avatar sx={{bgcolor:"white",color:"#3b82f6"}}>
          {selectedChat?.chatName?.charAt(0) || "C"}
        </Avatar>

        <Typography variant="h6" sx={{fontWeight:"bold"}}>
          {selectedChat?.chatName || "Chat"}
        </Typography>

      </Paper>


      {/* Messages Area */}

      <Box
        sx={{
          flex:1,
          p:3,
          overflowY:"auto"
        }}
      >

        {messages.map((msg)=>(
          <MessageBubble
            key={msg._id}
            message={msg}
            currentUser={user}
          />
        ))}

        {typing && <TypingIndicator/>}

        <div ref={bottomRef}></div>

      </Box>


      {/* Input Area */}

      <Paper
        elevation={6}
        sx={{
          p:2,
          display:"flex",
          alignItems:"center",
          gap:1,
          borderTopLeftRadius:20,
          borderTopRightRadius:20,
          background:"#ffffff"
        }}
      >

        <input
          type="file"
          ref={fileInputRef}
          style={{display:"none"}}
          onChange={(e)=>handleFileUpload(e.target.files[0])}
        />

        <IconButton
          color="primary"
          onClick={()=>fileInputRef.current.click()}
        >
          <AttachFileIcon/>
        </IconButton>


        <IconButton
          color="primary"
          onClick={()=>setShowEmojiPicker((prev)=>!prev)}
        >
          <InsertEmoticonIcon/>
        </IconButton>


        {showEmojiPicker && (
          <Box sx={{position:"absolute",bottom:90,zIndex:10}}>
            <Picker onEmojiClick={onEmojiClick}/>
          </Box>
        )}


        <TextField
          fullWidth
          placeholder="Type your message..."
          value={text}
          size="small"
          onChange={(e)=>{
            setText(e.target.value);
            handleTypingEvent();
          }}
          onKeyDown={(e)=>{
            if(e.key==="Enter" && !e.shiftKey){
              e.preventDefault();
              sendMessage();
            }
          }}
          sx={{
            "& .MuiOutlinedInput-root":{
              borderRadius:"20px"
            }
          }}
        />


        <IconButton
          onClick={()=>sendMessage()}
          sx={{
            background:"linear-gradient(45deg,#6366f1,#3b82f6)",
            color:"white",
            "&:hover":{
              background:"linear-gradient(45deg,#4f46e5,#2563eb)"
            }
          }}
        >
          <SendIcon/>
        </IconButton>

      </Paper>

    </Box>

  );

}