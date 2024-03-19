import client from '../db/db_connection.js';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const db = client.db('messagingApp');
const usersCollection = db.collection('users');

const secret = 'my   secret   key';

/******************* GET ALL USERS ******************
 *
 * Displaying all users
 *
 * */

export const getUsers = async (req, res) => {
  //get all the user from the database
  const users = await usersCollection.find().toArray();

  if (users.length === 0) {
    res.status(404).json({ error: 'No users found' });
    return;
  }
  const usersWithoutPassword = users.map((user) => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
  res.status(200).json(usersWithoutPassword);
};

/******************* ADD USER ******************
 *
 * Adding a new user by providing the name and password
 *
 * */

export const addUser = async (req, res) => {
  const { name, password } = req.body;
  if (!name || !password) {
    res
      .status(400)
      .json({ error: 'You must Provide both UserName and Password' });
    return;
  }

  if (name.length < 3) {
    res
      .status(400)
      .json({ error: 'Name should be at least 3 characters long' });
    return;
  }

  if (password.length < 8) {
    res
      .status(400)
      .json({ error: 'Password should be at least 8 characters long' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const userId = crypto.randomUUID();
  const newUser = { _id: userId, name, password: hashedPassword };

  // check if the user exists in the database
  const isUserExist = await usersCollection.findOne({ name: name });
  if (isUserExist)
    return res.status(400).json({ error: 'User name is already taken' });

  // add the user to the database
  const result = await usersCollection.insertOne(newUser);

  const newUserWithoutPassword = { ...newUser };
  delete newUserWithoutPassword.password;
  res.status(201).json(newUserWithoutPassword);
};

/******************* LOGIN ******************
 *
 * Logging in a user by providing the name and password
 *
 * */
export const login = async (req, res) => {
  const { name, password } = req.body;

  if (!name || !password) {
    res
      .status(400)
      .json({ error: 'You must Provide both UserName and Password' });
    return;
  }

  // check if the user exists in the database

  const isUserExist = await usersCollection.findOne({ name: name });

  if (!isUserExist) {
    res.status(400).json({ error: 'User does not exist' });
    return;
  }

  const user = isUserExist;
  const passwordCorrect = await bcrypt.compare(password, user.password);

  if (!passwordCorrect) {
    res.status(400).json({ error: 'Password is incorrect' });
    return;
  }

  const token = jwt.sign({ name: user.name, id: user.id }, secret, {
    expiresIn: '1h',
  });

  res.status(200).json({ token });
};
