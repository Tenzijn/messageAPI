import express from 'express';
import cors from 'cors';

import usersRouter from './routes/users.js';
import messagesRouter from './routes/messages.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/users', usersRouter);
app.use('/messages', messagesRouter);

export default app;
