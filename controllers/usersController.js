import fs from 'fs';

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

export let users = [];

const secret = 'my   secret   key';
const fileExists = fs.existsSync('users.json');

export const getUsers = async (req, res) => {
  if (fileExists) {
    const data = fs.readFileSync('users.json');
    const usersFromDatabase = JSON.parse(data);
    users = [...usersFromDatabase];
    const usersWithoutPassword = users.map((user) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
    res.status(200).json(usersWithoutPassword);
  } else {
    res.status(404).json({ error: 'No users found' });
  }
};

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
  let newUser = { id: userId, name, password: hashedPassword };

  if (fileExists) {
    const data = fs.readFileSync('users.json');
    const usersFromDatabase = JSON.parse(data);
    const userExists = usersFromDatabase.find((user) => user.name === name);
    if (userExists) {
      res.status(400).json({ error: 'User name is already taken' });
      return;
    }
    users = [...usersFromDatabase, newUser];
    usersFromDatabase.push(newUser);
    console.log(usersFromDatabase);
    fs.writeFileSync('users.json', JSON.stringify(usersFromDatabase));
  } else {
    users.push(newUser);
    fs.writeFileSync('users.json', JSON.stringify([newUser]));
  }

  const newUserWithoutPassword = { ...newUser };
  delete newUserWithoutPassword.password;

  res.status(201).json(newUserWithoutPassword);
};

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
