import jwt from 'jsonwebtoken';
import { users } from './usersController.js';

const messages = [];

const secret = 'my   secret   key';

export const getAllMessages = async (req, res) => {
  const sessionToken = req.headers.authorization.split(' ')[1];
  const decodedToken = jwt.verify(sessionToken, secret);

  const userMessages = messages.filter(
    (message) =>
      message.senderID === decodedToken.id ||
      message.receiverID === decodedToken.id
  );

  res.status(200).json(userMessages);
};

export const sendMessage = async (req, res) => {
  const { receiverID, message } = req.body;
  const sessionToken = req.headers.authorization.split(' ')[1];
  const decodedToken = jwt.verify(sessionToken, secret);
  const senderID = decodedToken.id;
  if (!receiverID || !message) {
    res
      .status(400)
      .json({ error: 'You must provide both receiverID and message' });
    return;
  }
  const receiverExists = users.find((user) => user.id === receiverID);
  if (!receiverExists) {
    res.status(400).json({ error: 'Receiver does not exist' });
    return;
  }
  if (message.length === 0) {
    res.status(400).json({ error: 'Message is empty' });
    return;
  }
  if (receiverID === senderID) {
    res.status(400).json({ error: 'You can not send a message to yourself' });
    return;
  }

  const messageId = crypto.randomUUID();

  const newMessage = { id: messageId, senderID, receiverID, message };
  messages.push(newMessage);

  res.status(201).json(newMessage);
};

export const updateMessage = async (req, res) => {
  const { message } = req.body;
  const messageId = req.params.id;
  const sessionToken = req.headers.authorization.split(' ')[1];
  const decodedToken = jwt.verify(sessionToken, secret);
  const senderID = decodedToken.id;
  const messageToUpdate = messages.find(
    (message) => message.id === Number(messageId)
  );

  if (!message) {
    res.status(400).json({ error: 'You must provide a message' });
    return;
  }

  if (message.length === 0) {
    res.status(400).json({ error: 'Message is empty' });
    return;
  }

  if (!messageToUpdate) {
    res.status(404).json({ error: 'Message not found' });
    return;
  }

  if (messageToUpdate.senderID !== senderID) {
    res.status(403).json({ error: 'You can not update this message' });
    return;
  }

  messageToUpdate.message = message;
  res.status(200).json(messageToUpdate);
};

export const deleteMessage = async (req, res) => {
  const messageId = req.params.id;
  const sessionToken = req.headers.authorization.split(' ')[1];
  const decodedToken = jwt.verify(sessionToken, secret);
  const senderID = decodedToken.id;
  const messageToDelete = messages.find(
    (message) => message.id === Number(messageId)
  );

  if (!messageToDelete) {
    res.status(404).json({ error: 'Message not found' });
    return;
  }

  if (messageToDelete.senderID !== senderID) {
    res.status(403).json({ error: 'You can not delete this message' });
    return;
  }

  const messageIndex = messages.indexOf(messageToDelete);
  messages.splice(messageIndex, 1);
  res
    .status(200)
    .json({ message: `MessageID:  ${messageToDelete.id} deleted ` });
};
