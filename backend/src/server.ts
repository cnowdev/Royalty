import app from "./app";
import { startCronJobs } from "./cron/startCronJobs";

const port = process.env.PORT || 3001;

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);

    startCronJobs();
})