import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const secret = 'my   secret   key';
export const users = [];

export const getUsers = async (req, res) => {
  const usersWithoutPassword = users.map((user) => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });

  res.status(200).json(usersWithoutPassword);
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

  const userExists = users.find((user) => user.name === name);
  if (userExists) {
    res.status(400).json({ error: 'User name is already taken' });
    return;
  }

  const userId = crypto.randomUUID();
  let newUser = { id: userId, name, password: hashedPassword };
  users.push(newUser);

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
