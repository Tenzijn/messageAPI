import client from '../db/db_connection.js';

import jwt from 'jsonwebtoken';

const db = client.db('messagingApp');
const messagesCollection = db.collection('messages');

const usersCollection = db.collection('users');

const secret = 'my   secret   key';

/******************* GET ALL MESSAGES ******************
 *
 * Displaying all messages for the user who is logged in
 *
 */
export const getAllMessages = async (req, res) => {
  const sessionToken = req.headers.authorization.split(' ')[1];
  const decodedToken = jwt.verify(sessionToken, secret);
  const sender = await usersCollection.findOne({ name: decodedToken.name });
  const senderID = sender._id;

  const allMessages = await messagesCollection.find().toArray();

  if (allMessages.length === 0) {
    res.status(404).json({ error: 'No messages found' });
    return;
  }

  const userMessages = allMessages.filter(
    (message) =>
      message.senderID === senderID || message.receiverID === senderID
  );
  res.status(200).json(userMessages);
};

/******************* SEND MESSAGE ******************
 *
 * Sending a message to another user by providing the receiverID and the message
 *
 */
export const sendMessage = async (req, res) => {
  const { receiverID, message } = req.body;
  const sessionToken = req.headers.authorization.split(' ')[1];
  const decodedToken = jwt.verify(sessionToken, secret);
  const sender = await usersCollection.findOne({ name: decodedToken.name });
  const senderID = sender._id;
  const date = new Date();

  if (!receiverID || !message) {
    res
      .status(400)
      .json({ error: 'You must provide both receiverID and message' });
    return;
  }

  // check if the receiver exists
  const receiverExists = await usersCollection.findOne({ _id: receiverID });

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

  const newMessage = { _id: messageId, date, senderID, receiverID, message };

  //write the new message to database
  const result = await messagesCollection.insertOne(newMessage);

  res.status(201).json(result);
};

/******************* UPDATE MESSAGE ******************
 *
 * Updating a message by providing the messageID at url and the new message  if the user is the sender of the message
 *
 */
export const updateMessage = async (req, res) => {
  const { message } = req.body;
  const messageId = req.params.id;
  const sessionToken = req.headers.authorization.split(' ')[1];
  const decodedToken = jwt.verify(sessionToken, secret);
  const lastUpdateDate = new Date();

  const sender = await usersCollection.findOne({ name: decodedToken.name });

  const senderID = sender._id;

  // find the message in the database

  const messageToBeUpdate = await messagesCollection.findOne({
    _id: messageId,
  });

  if (!message) {
    res.status(400).json({ error: 'You must provide a message' });
    return;
  }

  if (message.length === 0) {
    res.status(400).json({ error: 'Message is empty' });
    return;
  }

  if (!messageToBeUpdate) {
    res.status(404).json({ error: 'Message not found' });
    return;
  }

  if (messageToBeUpdate.senderID !== senderID) {
    res.status(403).json({ error: 'You can not update this message' });
    return;
  }
  //don't have to push to messages array because we are updating the message in messageToUpdate which is a reference to the message in the messages array

  //update the message in the database
  const result = await messagesCollection.updateOne(
    { _id: messageId },
    { $set: { message: message, updateDate: lastUpdateDate } }
  );

  res.status(200).json(result);
};

/******************* DELETE MESSAGE ******************
 *
 *  Deleting a message by providing the messageID at url if the user is the sender of the message
 *
 */
export const deleteMessage = async (req, res) => {
  const messageId = req.params.id;
  const sessionToken = req.headers.authorization.split(' ')[1];
  const decodedToken = jwt.verify(sessionToken, secret);

  const sender = await usersCollection.findOne({ name: decodedToken.name });

  const senderID = sender._id;

  // find the message in the database
  const messageToBeDelete = await messagesCollection.findOne({
    _id: messageId,
  });

  if (!messageToBeDelete) {
    res.status(404).json({ error: 'Message not found' });
    return;
  }

  if (messageToBeDelete.senderID !== senderID) {
    res.status(403).json({ error: 'You can not delete this message' });
    return;
  }

  //delete the message from the database
  const result = await messagesCollection.deleteOne({ _id: messageId });

  res.status(200).json(result);
};
