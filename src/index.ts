import express from 'express';
import { ICalCalendar } from 'ical-generator';
import axios from 'axios';
import DotEnv from "./init/dotenv";

DotEnv();

const app = express();
const port = 3000;

interface Task {
    id: number;
    title: string;
    description: string;
    done: boolean;
    done_at: string;
    due_date: string;
    reminders: string;
    project_id: number;
    repeat_after: number;
    repeat_mode: number;
    priority: number;
    start_date: string;
    end_date: string;
    assignees: string;
    labels: string;
    hex_color: string;
    percent_done: number;
    identifier: string;
    index: number;
    related_tasks: string;
    attachments: string;
    cover_image_attachment_id: number;
    is_favorite: boolean;
    created: string;
    updated: string;
    bucket_id: number;
    position: number;
    reactions: string;
    created_by: {
        id: number;
        name: string;
        username: string;
        created: string;
        updated: string;
    };
}

const checkEnv = () => {
    if (!process.env.PORT) {
        throw new Error("Port is not defined")
    }
    if (!process.env.URL) {
        throw new Error("URL is not defined")
    }
    if (!process.env.JWT_TOKEN) {
        throw new Error("JWT_TOKEN is not defined")
    }
    if (!process.env.AUTH_TOKEN) {
        throw new Error("AUTH_TOKEN is not defined")
    }
}

const convertTaskToICAL = (tasks: Task[]) => {
    const cal = new ICalCalendar({
        prodId: '//Airat Galiullin//Vikunja Calendar//RU',
        name: 'Vikunja Calendar',
        timezone: 'UTC',
    });

    tasks.forEach(task => {
        const event = {
            id: task.id.toString(),
            start: new Date(task.start_date),
            end: new Date(task.due_date),
            summary: task.title,
            description: "Ссылка на задачу: " + process.env.URL + "/tasks/" + task.id,
            location: '',
            url: '',
            categories: task.labels ? task.labels.split(',').map((label) => ({ name: label })) : [],
            // repeating: task.repeat_mode !== 0 ? {
            //     freq: task.repeat_mode === 1 ? ICalEventRepeatingFreq.WEEKLY : ICalEventRepeatingFreq.DAILY,
            //     count: task.repeat_after,
            //     until: new Date(task.due_date)
            // } : undefined,
        };

        cal.createEvent(event);
    });

    return cal.toString();
}

app.get('/ical*', async (req, res) => {
    const tasks: Task[] = [];
    const paths = req.path.split("/")
    const reqToken = paths[paths.length - 1]
    if (reqToken === process.env.AUTH_TOKEN) {
        let page = 1;
        const loadData = async (page = 1) => {
            const caldavData = await axios.get(`${process.env.URL!}/api/v1/tasks/all?page=${page}`, { headers: { "Authorization": `Bearer ${process.env.JWT_TOKEN!}`, "Accept": "application/json" } });
            tasks.push(...caldavData.data)
            return caldavData.headers["x-pagination-total-pages"];
        }
        const totalPages = await loadData();
        while (page < totalPages) {
            page++;
            await loadData(page);
        }
        const icalData = convertTaskToICAL(tasks.filter(task => task.start_date !== "0001-01-01T00:00:00Z" && task.due_date !== "0001-01-01T00:00:00Z"));
        res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename=calendar.ics');
        res.send(icalData);
    } else {
        res.send("401 Unathorized")
    }
});

app.listen(process.env.PORT, () => {
    console.log(`The server app is listening on http://localhost:${process.env.PORT}`);
});