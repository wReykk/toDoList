import { writeFile, readFile } from 'node:fs/promises';

interface ITask {
    id: number
    description: string
    status: Status
    createdAt: string
    updatedAt?: string
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

    public async addTask(description: string) {
        const id = this.checkId()
        const createdAt = new Date().toISOString()
        const newTask = new Task(id, description, 'todo', createdAt)
        this.tasks.push(newTask)
        await this.saveTasks()
        console.log(`${description} added to the list.`)
    }

    public async deleteTask(id: number) {
        this.tasks = this.tasks.filter(task => task.id !== id)
        await this.saveTasks()
    }

    public async updateTaskStatus(id: number, status: Status) {
        const targetTask = this.tasks.find(task => task.id === id)
        if (targetTask === undefined) {
            console.warn('error')
            return
        } else {
            targetTask.status = status
            targetTask.updatedAt = new Date().toISOString()
        }
        await this.saveTasks()
    }

    public async updateTaskDescription(id: number, description: string) {
        const targetTask = this.tasks.find(task => task.id === id)
        if (targetTask === undefined) {
            console.warn('error')
            return
        } else {
            targetTask.description = description
            targetTask.updatedAt = new Date().toISOString()
        }
        await this.saveTasks()
    }

    public listTasks(status?: Status) {
        if (status === undefined) {
            console.log(this.tasks)
        } else {
            const filteredList = this.tasks.filter(task => task.status === status)
            console.log(filteredList);
        }
    }


    private checkId() {
        if (this.tasks.length === 0) {
            return 1
        }
        const ids = this.tasks.map((task) => task.id)
        return (Math.max(...ids) + 1)
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
}


const service = new TaskService()
await service.init()
// await service.addTask('Wash dishes')
// await service.addTask('Buy bread')
// await service.addTask('Visit grandma')
// await service.addTask('Do homework')
// await service.addTask('Water plants')

// await service.deleteTask(1)
// await service.updateTaskStatus(4, 'done')
// await service.updateTaskStatus(5, 'in-progress')
// await service.updateTaskDescription(2, 'Buy milk')
// service.listTasks()

// console.log(process.argv)

const command = process.argv[2];
const arg1 = process.argv[3];
const arg2 = process.argv[4];

switch (command) {
    case 'add':
        if (!arg1 || arg1.trim() === '') {
            console.error('Empty task')
        } else {
            await service.addTask(String(arg1))
        }
        break;
    case 'delete':
        if (!arg1 || isNaN(Number(arg1))) {
            console.error('Empty id')
        } else {
            await service.deleteTask(Number(arg1))
        }
        break;
    case 'mark':
        if (!arg1 || isNaN(Number(arg1))) {
            console.error('Empty id')
        } else if (!arg2 || arg2.trim() === '') {
            console.error('Undefined status')
        } else if (arg2 === 'todo' || arg2 === 'in-progress' || arg2 === 'done') {
            await service.updateTaskStatus(Number(arg1), arg2)
        } else {
            console.log('Wrong status')
        }
        break
    case 'update':
        if (!arg1 || isNaN(Number(arg1))) {
            console.error('Empty args')
        } else if (!arg2 || arg2.trim() === '') {
            console.error('Undefined description')
        } else {
            await service.updateTaskDescription(Number(arg1), String(arg2))
        }
        break
    case 'list':
        if (arg1 === 'todo' || arg1 === 'in-progress' || arg1 === 'done') {
            service.listTasks(arg1)
        } else {
            service.listTasks()
        }
        break;
    case 'q':
        break;
    default:
        console.log('Unknown command');
}