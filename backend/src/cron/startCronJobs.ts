import cron from 'node-cron';
import { updateStaleProducts } from './updateStaleProducts';

export const startCronJobs = () => {
    console.log('Starting cron jobs...');

    // Run every day at 2 AM
    cron.schedule('0 2 * * *', async () => {
        console.log('Running daily product update job at 2 AM');
        try {
            await updateStaleProducts();
        } catch (error) {
            console.error('Daily product update job failed:', error);
        }
    }, {
        timezone: "America/New_York" // Adjust to your timezone
    });

    console.log('Cron jobs started successfully');
};