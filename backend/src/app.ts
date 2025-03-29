import express from 'express';

const app = express();
app.use(express.json());

app.get('/', (req: any, res: { send: (arg0: string) => void; }) => {
    res.send('Hello, world!');
});


export default app;