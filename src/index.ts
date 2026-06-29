import { writeFile, readFile } from 'node:fs/promises';

interface ITask {
    id: number
    description: string
    status: Status
    createdAt: string
    // updatedAt: string
}

type Status = 'todo' | 'in-progress' | 'done'

class Task implements ITask {
    constructor(public id: number, public description: string, public status: Status, public createdAt: string) {
    }
}

class TaskService {
    private tasks: ITask[] = []
    public async init() {
        try {
            const data = await readFile('./output.json', 'utf8');
            if (data) {
                this.tasks = this.safeParseTask(data)
            }
        } catch (error) {
            console.log(error)
        }
    }

    public addTask(description: string) {
        const id = Math.round(Math.random() * 1000)
        const createdAt = new Date().toISOString()
        const newTask = new Task(id, description, 'todo', createdAt)
        this.tasks.push(newTask)
        this.saveTasks()
        console.log(`${description} added to the list.`)
    }

    private safeParseTask(json: string): ITask[] {
        try {
            const parsed: unknown = JSON.parse(json);

            // Explicit runtime structural check
            if (Array.isArray(parsed)) {
                const validTasks: ITask[] = []
                for (const item of parsed) {
                    if (item && typeof item === 'object' && 'id' in item) {
                        validTasks.push(item as ITask)
                    } else {
                        console.warn('Damaged key, skipping...')
                    }
                }

                return validTasks as ITask[];
            }
            return [];
        } catch (error) {
            console.error("Invalid JSON format string", error);
            return [];
        }
    }



    public async listTasks() {
        console.log(this.tasks);
    }


    private async saveTasks() {
        try {
            // The arguments (null, 2) pretty-print the JSON with a 2-space indentation
            const jsonString = JSON.stringify(this.tasks, null, 2);
            await writeFile('output.json', jsonString, 'utf-8');
            console.log('JSON file saved successfully!');
        } catch (error) {
            console.error('Error writing file:', error);
        }
    }
}




const service = new TaskService()
await service.init()
service.addTask('Wash dishes')
service.addTask('Buy bread')
service.addTask('Visit grandma')
service.listTasks()