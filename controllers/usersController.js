import fs from 'fs';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export let users = [];

const secret = 'my   secret   key';
const fileExists = fs.existsSync('users.json');

if (fileExists) {
  const data = fs.readFileSync('users.json');
  const usersFromDatabase = JSON.parse(data);
  users = [...usersFromDatabase];
}

/******************* GET ALL USERS ******************
 *
 * Displaying all users
 *
 * */

export const getUsers = async (req, res) => {
  if (!fileExists) {
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
  const newUser = { id: userId, name, password: hashedPassword };
  const userExists = users.find((user) => user.name === name);
  if (userExists)
    return res.status(400).json({ error: 'User name is already taken' });

  if (!fileExists) {
    users.push(newUser);
    fs.writeFileSync('users.json', JSON.stringify([newUser]));
    return;
  }

  users.push(newUser);
  fs.writeFileSync('users.json', JSON.stringify(users));
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

  // check if the user exists
  const user = users.find((user) => user.name === name);
  if (!user) {
    res.status(400).json({ error: 'User does not exist' });
    return;
  }

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
