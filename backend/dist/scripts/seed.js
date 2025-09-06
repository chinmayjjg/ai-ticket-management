"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const database_1 = __importDefault(require("../config/database"));
const User_1 = require("../models/User");
const Ticket_1 = require("../models/Ticket");
dotenv_1.default.config();
const seedUsers = async () => {
    try {
        // Clear existing users
        await User_1.User.deleteMany({});
        // Create default users
        const users = [
            {
                name: 'John Agent',
                email: 'agent@superops.com',
                password: 'password123',
                role: 'agent'
            },
            {
                name: 'Sarah Admin',
                email: 'admin@superops.com',
                password: 'password123',
                role: 'admin'
            },
            {
                name: 'Mike Support',
                email: 'mike@superops.com',
                password: 'password123',
                role: 'agent'
            }
        ];
        const createdUsers = await User_1.User.insertMany(users);
        console.log('✅ Users seeded successfully');
        return createdUsers;
    }
    catch (error) {
        console.error('❌ Error seeding users:', error);
        throw error;
    }
};
const seedTickets = async (users) => {
    try {
        // Clear existing tickets
        await Ticket_1.Ticket.deleteMany({});
        const agents = users.filter(user => user.role === 'agent');
        if (agents.length === 0) {
            console.log('⚠️ No agents found, skipping ticket seeding');
            return;
        }
        // Create sample tickets
        const tickets = [
            {
                title: 'Login page not loading',
                description: 'The login page shows a blank screen after clicking submit button. This started happening after the latest update.',
                priority: 'high',
                category: 'bug-report',
                status: 'open',
                createdBy: users[0]._id,
                assignedTo: agents[0]._id
            },
            {
                title: 'Add dark mode feature',
                description: 'Users are requesting a dark mode toggle in the settings. This would improve user experience for users working in low-light environments.',
                priority: 'low',
                category: 'feature-request',
                status: 'open',
                createdBy: users[1]._id,
                assignedTo: agents[0]._id
            },
            {
                title: 'Payment processing failed',
                description: 'Customer unable to process payment for premium subscription. Error message shows "Payment gateway timeout".',
                priority: 'urgent',
                category: 'billing',
                status: 'in-progress',
                createdBy: users[0]._id,
                assignedTo: agents.length > 1 ? agents[1]._id : agents[0]._id
            },
            {
                title: 'API rate limiting documentation',
                description: 'Need comprehensive documentation for API rate limiting policies and best practices for developers.',
                priority: 'medium',
                category: 'technical',
                status: 'open',
                createdBy: users[1]._id,
                assignedTo: agents[0]._id
            },
            {
                title: 'Email notifications not working',
                description: 'Users report not receiving email notifications for ticket updates. SMTP configuration might need review.',
                priority: 'high',
                category: 'bug-report',
                status: 'resolved',
                createdBy: users[0]._id,
                assignedTo: agents.length > 1 ? agents[1]._id : agents[0]._id
            }
        ];
        await Ticket_1.Ticket.insertMany(tickets);
        console.log('✅ Tickets seeded successfully');
    }
    catch (error) {
        console.error('❌ Error seeding tickets:', error);
        throw error;
    }
};
const runSeed = async () => {
    try {
        console.log('🌱 Starting database seeding...');
        // Connect to database
        await (0, database_1.default)();
        // Seed users first
        const users = await seedUsers();
        // Then seed tickets
        await seedTickets(users);
        console.log('🎉 Database seeding completed successfully!');
        console.log('\n📧 Test accounts created:');
        console.log('Agent: agent@superops.com / password123');
        console.log('Admin: admin@superops.com / password123');
        console.log('Agent 2: mike@superops.com / password123');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};
// Run the seed script if called directly
if (require.main === module) {
    runSeed();
}
exports.default = runSeed;
