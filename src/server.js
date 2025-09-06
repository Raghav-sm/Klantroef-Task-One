import { app, connectDB } from './app.js';

const PORT = process.env.PORT || 5000;

//database string now added yet..
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});